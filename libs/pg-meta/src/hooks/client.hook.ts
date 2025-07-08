import { Inject, Injectable, Logger } from '@nestjs/common';
import { Hook } from '@nuvix/core/server';
import { GET_PROJECT_DB_CLIENT, PROJECT, PROJECT_POOL } from '@nuvix/utils/constants';

import { CLIENT } from '../constants';
import { PostgresMeta } from '../lib';
import { Pool } from 'pg';
import { GetClientFn } from '@nuvix/core';
import { Document } from '@nuvix/database';

@Injectable()
export class ResolveClient implements Hook {
  private readonly logger = new Logger(ResolveClient.name);

  constructor(@Inject(GET_PROJECT_DB_CLIENT) private readonly getPool: GetClientFn) { }

  async preHandler(req: NuvixRequest) {
    const project = req[PROJECT] as Document;
    const dbOptions = project.getAttribute('database');
    const pool = await this.getPool(project.getId(), {
      database: dbOptions.name,
      user: dbOptions.userRole,
      password: dbOptions.password,
      port: dbOptions.port,
      host: dbOptions.host,
      max: 30,
    });

    req[CLIENT] = new PostgresMeta(pool);
    return;
  }

  // async onResponse(req: NuvixRequest, reply: NuvixRes,) {
  //   const pgMeta = req[CLIENT] as PostgresMeta;
  // }
}
