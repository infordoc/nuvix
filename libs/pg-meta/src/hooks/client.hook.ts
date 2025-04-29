import { Injectable, Logger } from '@nestjs/common';
import { Hook } from '@nuvix/core/server';
import { PROJECT_POOL } from '@nuvix/utils/constants';
import { FastifyRequest } from 'fastify';
import { CLIENT } from '../constants';
import { PostgresMeta } from '../lib';
import { Pool } from 'pg';

@Injectable()
export class ResolveClient implements Hook {
  private readonly logger = new Logger(ResolveClient.name);

  async preHandler(req: FastifyRequest) {
    const pool = req[PROJECT_POOL] as Pool;
    req[CLIENT] = new PostgresMeta(pool);
    return;
  }

  async onResponse(req: FastifyRequest) {
    this.logger.verbose('trying to close pgMeta connection');
    const pgMeta = req[CLIENT] as PostgresMeta;
    if (!pgMeta) {
      this.logger.verbose('pgMeta connection already closed');
      return;
    }
    try {
      await pgMeta.end();
      this.logger.verbose('pgMeta connection closed successfully');
    } catch (e: any) {
      this.logger.error(`Error closing pgMeta connection: ${e.message}`);
    }
  }
}
