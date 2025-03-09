import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@nuvix/database';
import {
  METRIC_NETWORK_INBOUND,
  METRIC_NETWORK_OUTBOUND,
  METRIC_NETWORK_REQUESTS,
  PROJECT,
} from 'src/Utils/constants';
import { ProjectUsageService } from 'src/core/project-usage.service';
import { BaseHook, Hooks } from './base.hook';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

@Injectable()
export class ProjectUsageHook implements BaseHook {
  private readonly logger = new Logger(ProjectUsageHook.name);
  hookName: Hooks = 'onSend';

  constructor(private readonly projectUsage: ProjectUsageService) {}

  async run(
    req: FastifyRequest,
    reply: FastifyReply,
    fastify: FastifyInstance,
    payload,
  ): Promise<void> {
    try {
      const project: Document = req[PROJECT];
      this.logger.debug(`Project: ${project.getId()}, Path: ${req.url}`);

      if (project.getId() !== 'console') {
        const outboundSize = Buffer.byteLength(payload || ''); // Get response size

        if (reply.statusCode >= 500) return; // Ignore 5xx errors

        const inboundSize =
          parseInt(req.headers['content-length'] || '0', 10) || 0;

        await this.projectUsage.addMetric(METRIC_NETWORK_REQUESTS, 1);
        await this.projectUsage.addMetric(METRIC_NETWORK_INBOUND, inboundSize);
        await this.projectUsage.addMetric(
          METRIC_NETWORK_OUTBOUND,
          outboundSize,
        );

        this.logger.debug(`Inbound: ${inboundSize}, Outbound: ${outboundSize}`);
      }
    } catch (error) {
      this.logger.error(`Usage hook failed: ${error.message}`);
    }
  }
}
