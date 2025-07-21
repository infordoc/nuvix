import { Inject, Injectable } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { Context, DataSource } from '@nuvix/pg';

import type { GetProjectDbFn, GetProjectPG } from '@nuvix/core/core.module';
import { Exception } from '@nuvix/core/extend/exception';
import { Hook } from '@nuvix/core/server';
import {
  CURRENT_SCHEMA_DB,
  CURRENT_SCHEMA_PG,
  GET_PROJECT_DB,
  GET_PROJECT_PG,
  PROJECT,
  PROJECT_DB_CLIENT,
  PROJECT_PG,
} from '@nuvix/utils/constants';

@Injectable()
export class SchemaHook implements Hook {
  constructor(
    @Inject(GET_PROJECT_PG) private readonly getProjectPG: GetProjectPG,
    @Inject(GET_PROJECT_DB) private readonly getProjectDB: GetProjectDbFn,
  ) { }

  async preHandler(request: NuvixRequest) {
    const project = request[PROJECT] as Document;
    if (project.isEmpty() || project.getId() === 'console') {
      throw new Exception(Exception.PROJECT_NOT_FOUND);
    }

    const client = request[PROJECT_DB_CLIENT];
    const pg = request[PROJECT_PG] as DataSource;

    const schemaId =
      (request.params as { schemaId: string | undefined }).schemaId ?? 'public';
    if (schemaId === undefined) return;
    const schema = await pg.getSchema(schemaId);
    if (schema) {
      const pg = this.getProjectPG(
        client,
        new Context({
          schema: schema.name,
        }),
      );
      request[CURRENT_SCHEMA_PG] = pg;
      if (schema.type === 'document') {
        const db = this.getProjectDB(client, project.getId());
        db.setDatabase(schema.name).setCacheName(`${project.getId()}:${schemaId}`);
        request[CURRENT_SCHEMA_DB] = db;
      }
    } else {
      throw new Exception(Exception.SCHEMA_NOT_FOUND);
    }

    return null;
  }
}
