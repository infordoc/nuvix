import { Inject, Injectable } from '@nestjs/common';
import { Context, DataSource } from '@nuvix/pg';
import { FastifyRequest } from 'fastify';
import { GetProjectPG } from 'src/core/core.module';
import { Exception } from 'src/core/extend/exception';
import { Hook } from 'src/core/server';
import {
  CURRENT_SCHEMA_DB,
  GET_PROJECT_PG,
  PROJECT_PG,
  PROJECT_POOL,
} from 'src/Utils/constants';

@Injectable()
export class SchemaHook implements Hook {
  constructor(
    @Inject(GET_PROJECT_PG) private readonly getProjectPG: GetProjectPG,
  ) {}

  async preHandler(request: FastifyRequest) {
    const pool = request[PROJECT_POOL];
    const pg = request[PROJECT_PG] as DataSource;

    const schemaId = (request.params as { schema: string | undefined }).schema;
    if (schemaId === undefined) return;

    const schema = await pg.getSchema(schemaId);
    if (!schema) throw new Exception(Exception.DATABASE_NOT_FOUND);

    const db = this.getProjectPG(
      pool,
      new Context({
        schema: schema.name,
      }),
    );
    request[CURRENT_SCHEMA_DB] = db;

    return null;
  }
}
