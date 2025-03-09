import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { PROJECT, SERVER_CONFIG } from 'src/Utils/constants';
import { BaseHook } from './base.hook';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class CorsHook implements BaseHook {
  private readonly logger = new Logger(CorsHook.name);
  hookName: 'onRequest' = 'onRequest';

  async run(
    req: FastifyRequest,
    reply: FastifyReply,
    fastify: FastifyInstance,
  ): Promise<void> {
    try {
      const hostname = req.hostname;
      const project: Document = req[PROJECT];

      const isConsoleRequest =
        project.getId() === 'console' || hostname === SERVER_CONFIG.host;
      const isAllowedOrigin = SERVER_CONFIG.allowedOrigins.includes(hostname);

      if (isConsoleRequest || isAllowedOrigin) {
        reply.header('Access-Control-Allow-Origin', hostname);
        reply.header('Access-Control-Allow-Methods', SERVER_CONFIG.methods);
        reply.header(
          'Access-Control-Allow-Headers',
          SERVER_CONFIG.allowedHeaders.join(', '),
        );
        reply.header(
          'Access-Control-Expose-Headers',
          SERVER_CONFIG.exposedHeaders.join(', '),
        );
        reply.header(
          'Access-Control-Allow-Credentials',
          SERVER_CONFIG.credentials ? 'true' : 'false',
        );
      } else {
        reply.header('Access-Control-Allow-Origin', 'null');
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return reply.status(204).send();
      }
    } catch (error) {
      this.logger.error(`CORS setup failed: ${error.message}`);
    }
  }
}
