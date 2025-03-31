import { Inject, Injectable, Logger } from '@nestjs/common';
import { Authorization, Database, Document } from '@nuvix/database';
import ParamsHelper from 'src/core/helper/params.helper';
import { FastifyRequest, FastifyReply } from 'fastify';
import {
  DB_FOR_CONSOLE,
  GET_PROJECT_DB,
  POOLS,
  PROJECT,
  PROJECT_DB,
} from 'src/Utils/constants';
import { Hook } from '../../server/hooks/interface';
import { PoolStoreFn } from 'src/core/core.module';
import { Exception } from 'src/core/extend/exception';

@Injectable()
export class ProjectHook implements Hook {
  private readonly logger = new Logger(ProjectHook.name);
  constructor(
    @Inject(DB_FOR_CONSOLE) private readonly db: Database,
    @Inject(POOLS) private readonly getPool: PoolStoreFn,
    @Inject(GET_PROJECT_DB)
    private readonly getProjectDb: (pool: any, id: any) => Promise<Database>,
  ) {}

  async onRequest(req: FastifyRequest, reply: FastifyReply) {
    const params = new ParamsHelper(req);
    const projectId =
      params.getFromHeaders('x-nuvix-project') ||
      params.getFromQuery('project', 'console');

    if (projectId === 'console') {
      req[PROJECT] = new Document({ $id: 'console' });
      return null;
    }

    const project = await Authorization.skip(
      async () => await this.db.getDocument('projects', projectId as string),
    );

    if (!project.isEmpty()) {
      this.logger.debug(`Project: ${project.getAttribute('name')}`);
      const databaseName = project.getAttribute('database');
      try {
        const pool = await this.getPool(project.getId(), {
          database: databaseName,
        });
        req[PROJECT_DB] = await this.getProjectDb(
          pool,
          project.getInternalId(),
        );
      } catch (e) {
        this.logger.error('Something wen wrong while connecting database.', e);
        throw new Exception(Exception.GENERAL_SERVER_ERROR);
      }
    }

    req[PROJECT] = project;
    return null;
  }
}
