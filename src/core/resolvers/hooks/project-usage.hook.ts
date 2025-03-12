import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@nuvix/database';
import {
  METRIC_NETWORK_INBOUND,
  METRIC_NETWORK_OUTBOUND,
  METRIC_NETWORK_REQUESTS,
  PROJECT,
} from 'src/Utils/constants';
import { ProjectUsageService } from 'src/core/project-usage.service';
import { Hook } from './base.hook';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class ProjectUsageHook implements Hook {
  private readonly logger = new Logger(ProjectUsageHook.name);
  constructor(private readonly projectUsage: ProjectUsageService) {}

  async onSend(
    req: FastifyRequest,
    reply: FastifyReply,
    payload: any,
  ): Promise<void> {
    try {
      const project: Document = req[PROJECT];
      this.logger.debug(`Project: ${project.getId()}, Path: ${req.url}`);

      if (project.getId() !== 'console') {
        // Calculate inbound size
        const inboundSize =
          parseInt(req.headers['content-length'] || '0', 10) ||
          Buffer.byteLength(JSON.stringify(req.headers)) +
            Buffer.byteLength((req.body as any) || '');

        // Calculate outbound size
        const outboundSize =
          Buffer.byteLength(payload || '') +
          Buffer.byteLength(JSON.stringify(reply.getHeaders()));

        // Track metrics
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
