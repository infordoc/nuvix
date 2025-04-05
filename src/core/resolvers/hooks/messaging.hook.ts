import { Inject, Injectable } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { FastifyRequest } from 'fastify';
import { GetProjectDbFn } from 'src/core/core.module';
import { Hook } from 'src/core/server';
import {
  GET_PROJECT_DB,
  MESSAGING_SCHEMA_DB,
  PROJECT,
  PROJECT_POOL,
} from 'src/Utils/constants';

@Injectable()
export class MessagingHook implements Hook {
  constructor(
    @Inject(GET_PROJECT_DB) private readonly getProjectDB: GetProjectDbFn,
  ) {}

  async preHandler(request: FastifyRequest) {
    const project = request[PROJECT] as Document;
    const pool = request[PROJECT_POOL];
    const db = this.getProjectDB(pool, project.getId());
    db.setDatabase('messaging`');
    request[MESSAGING_SCHEMA_DB] = db;
    return null;
  }
}
