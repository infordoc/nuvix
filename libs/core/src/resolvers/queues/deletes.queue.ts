import { Processor } from '@nestjs/bullmq'
import { Queue } from './queue'
import { configuration, DeleteType, QueueFor } from '@nuvix/utils'
import { Job } from 'bullmq'
import { Database, Doc, IEntity, Query } from '@nuvix/db'
import { ProjectsDoc, Schedules, TopicsDoc } from '@nuvix/utils/types'
import { CoreService } from '@nuvix/core/core.service'
import { deleteTargets } from '@nuvix/core/helper/misc.helper'

@Processor(QueueFor.DELETES, { concurrency: 1000 })
export class DeletesQueue extends Queue {
  private readonly dbForPlatform: Database

  constructor(private readonly coreService: CoreService) {
    super()
    this.dbForPlatform = this.coreService.getPlatformDb()
  }

  override process(
    job: Job<DeletesJobData, unknown, DeleteType>,
  ): Promise<any> {
    switch (job.name) {
      case DeleteType.DATABASES:
      case DeleteType.DOCUMENT:
      case DeleteType.COLLECTIONS:
      case DeleteType.TEAM_PROJECTS:
      case DeleteType.EXECUTIONS:
      case DeleteType.AUDIT:
      case DeleteType.ABUSE:
      case DeleteType.USAGE:
      case DeleteType.REALTIME:
      case DeleteType.SESSIONS:
      case DeleteType.SCHEDULES:
      case DeleteType.TOPIC:
      case DeleteType.TARGET:
      case DeleteType.EXPIRED_TARGETS:
      case DeleteType.SESSION_TARGETS:
      default:
        throw new Error('Invalid Job in deletes queue')
    }
  }

  /**
   * Delete schedules which are inactive and their resource is deleted or updated before given datetime
   */
  private async deleteSchedules(datetime: string): Promise<void> {
    const regions = [configuration.app.region || 'default']

    await this.listByGroup<Schedules>(
      'schedules',
      [
        Query.equal('region', regions),
        Query.lessThanEqual('resourceUpdatedAt', datetime),
        Query.equal('active', [false]),
      ],
      this.dbForPlatform,
      async document => {
        const project = await this.dbForPlatform.getDocument(
          'projects',
          document.get('projectId'),
        )

        if (project.empty()) {
          await this.dbForPlatform.deleteDocument('schedules', document.getId())
          console.log(
            'Deleted schedule for deleted project ' + document.get('projectId'),
          )
          return
        }

        let collectionId: string
        switch (document.get('resourceType')) {
          case 'function':
            collectionId = 'functions'
            break
          case 'execution':
            collectionId = 'executions'
            break
          case 'message':
            collectionId = 'messages'
            break
          default:
            return
        }

        let resource: Doc
        try {
          resource = await this.withDatabase(project, db => {
            return db.getDocument(collectionId, document.get('resourceId'))
          })
        } catch (e: any) {
          console.error(
            'Failed to get resource for schedule ' +
              document.getId() +
              ' ' +
              e.message,
          )
          return
        }

        let shouldDelete = true

        switch (document.get('resourceType')) {
          case 'function':
            shouldDelete = resource.empty()
            break
          case 'execution':
            shouldDelete = false
            break
        }

        if (shouldDelete) {
          await this.dbForPlatform.deleteDocument('schedules', document.getId())
          console.log(
            'Deleting schedule for ' +
              document.get('resourceType') +
              ' ' +
              document.get('resourceId'),
          )
        }
      },
    )
  }

  /**
   * Delete topic and its subscribers
   */
  private async deleteTopic(
    project: ProjectsDoc,
    topic: TopicsDoc,
  ): Promise<void> {
    if (topic.empty()) {
      console.error('Failed to delete subscribers. Topic not found')
      return
    }

    await this.withDatabase(project, db => {
      return this.deleteByGroup(
        'subscribers',
        [
          Query.equal('topicInternalId', [topic.getSequence()]),
          Query.orderAsc(),
        ],
        db,
      ).catch((e: any) => {
        console.error('Failed to delete subscribers: ' + e.message)
      })
    })
  }

  /**
   * Delete expired targets
   */
  private async deleteExpiredTargets(project: ProjectsDoc): Promise<void> {
    await this.withDatabase(project, db => {
      return deleteTargets(db, Query.equal('expired', [true]))
    })
  }

  /**
   * Delete session targets
   */
  private async deleteSessionTargets(
    project: ProjectsDoc,
    session: Doc,
  ): Promise<void> {
    await this.withDatabase(project, db => {
      return deleteTargets(
        db,
        Query.equal('sessionInternalId', [session.getSequence()]),
      )
    })
  }

  private async withDatabase<T>(
    project: ProjectsDoc,
    callback: (db: Database) => Promise<T>,
  ) {
    let _client: any
    try {
      const { dbForProject, client } =
        await this.coreService.createProjectDatabase(project)
      _client = client
      return callback(dbForProject)
    } finally {
      await this.coreService.releaseDatabaseClient(_client)
    }
  }

  protected async deleteByGroup<T extends IEntity>(
    collection: string,
    queries: Query[],
    database: Database,
    callback?: (doc: Doc<T>) => void | Promise<void>,
  ): Promise<void> {
    const start = Date.now()
    const batch_limit = 500 // TODO: --------------

    try {
      const count = await database.deleteDocumentsBatch(
        collection,
        queries,
        batch_limit,
        callback,
      )

      const end = Date.now()
      console.info(
        `Deleted ${count} documents by group in ${(end - start) / 1000} seconds`,
      )
    } catch (error: any) {
      console.error(
        `Failed to delete documents for collection:${database.namespace}_${collection} :${error.message}`,
      )
    }
  }

  protected async listByGroup<T extends IEntity>(
    collection: string,
    queries: Query[],
    database: Database,
    callback?: (doc: Doc<T>) => void | Promise<void>,
  ): Promise<void> {
    let count = 0
    const limit = 1000
    let sum = limit
    let cursor: Doc<T> | null = null

    const start = Date.now()

    while (sum === limit) {
      const paginatedQueries = [...queries, Query.limit(limit)]

      if (cursor !== null) {
        paginatedQueries.push(Query.cursorAfter(cursor))
      }

      const results = await database.find<T>(collection, paginatedQueries)

      sum = results.length

      if (sum > 0) {
        cursor = results[sum - 1] as Doc<T>
      }

      for (const document of results) {
        if (callback) {
          await callback(document)
        }
        count++
      }
    }

    const end = Date.now()

    console.info(
      `Listed ${count} documents by group in ${(end - start) / 1000} seconds`,
    )
  }
}

export type DeletesJobData = {}
