import { Logger } from '@nestjs/common'
import {
  Database,
  Doc,
  Permission,
  Role,
  DuplicateException,
  Authorization,
  ID,
} from '@nuvix/db'
import collections from '@nuvix/utils/collections'
import { Audit } from '@nuvix/audit'
import { AppConfigService, CoreService } from '@nuvix/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Schemas } from '@nuvix/utils'
import { AccountService } from '../account/account.service'
import { ProjectService } from '../projects/projects.service'
import { ProjectsQueue } from '@nuvix/core/resolvers'

export async function initSetup(
  app: NestFastifyApplication,
  config: AppConfigService,
) {
  const logger = new Logger('Setup')
  const coreService = app.get(CoreService)
  try {
    logger.log('Initializing server setup...')
    const pool = coreService.createProjectDbClient('initial-setup')
    await pool
      .query(`create schema if not exists ${Schemas.Internal};`)
      .catch(e => logger.error('Error creating internal schema', e))
      .finally(() => pool.end())

    const db = coreService.getPlatformDb()

    try {
      await db.getCache().flush()
      await db.create()
    } catch (e) {
      if (!(e instanceof DuplicateException)) throw e
    }

    logger.log(`Starting...`)
    await Authorization.skip(async () => {
      const internalCollections = collections.internal
      for (const [_, collection] of Object.entries(internalCollections)) {
        if (collection.$collection !== Database.METADATA) {
          continue
        }
        if (await db.exists(db.schema, collection.$id)) {
          continue
        }

        logger.log(`Creating collection: ${collection.$id}...`)

        const attributes = collection.attributes.map(
          attribute => new Doc(attribute),
        )

        const indexes = (collection.indexes ?? []).map(index => new Doc(index))

        await db.createCollection({
          id: collection.$id,
          attributes,
          indexes,
          permissions: [Permission.create(Role.any())],
          documentSecurity: true,
        })
      }

      const defaultBucket = await db.getDocument('buckets', 'default')
      if (defaultBucket.empty() && !(await db.exists(db.schema, 'bucket_1'))) {
        logger.log('Creating default bucket...')

        await db.createDocument(
          'buckets',
          new Doc({
            $id: 'default',
            $collection: 'buckets',
            name: 'Default',
            maximumFileSize: 10 * 1024 * 1024, // 10MB
            allowedFileExtensions: [],
            enabled: true,
            compression: 'gzip',
            encryption: true,
            antivirus: true,
            fileSecurity: true,
            $permissions: [
              Permission.read(Role.any()),
              Permission.create(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any()),
            ],
            search: 'buckets Default',
          }),
        )

        const bucket = await db.getDocument('buckets', 'default')
        logger.log('Creating files collection for default bucket...')

        const files = collections.bucket['files']
        if (!files) {
          throw new Error('Files collection is not configured.')
        }

        const fileAttributes = files.attributes.map(
          attribute => new Doc(attribute),
        )

        const fileIndexes = files.indexes?.map(index => new Doc(index))

        await db.createCollection({
          id: `bucket_${bucket.getSequence()}`,
          attributes: fileAttributes,
          indexes: fileIndexes,
        })
      }
      if (!(await db.exists(db.schema, Audit.COLLECTION))) {
        logger.log('Creating Audit Collection.')
        await new Audit(db).setup()
      }

      logger.log('Successfully complete the server setup.')
      await db.getCache().flush()
    })
  } catch (error: any) {
    logger.error(`Error while setting up server: ${error.message}`, error.stack)
    throw error
  }
}
