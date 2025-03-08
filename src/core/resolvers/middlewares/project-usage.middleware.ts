import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { Request, Response, NextFunction } from 'express';
import {
  CACHE_DB,
  METRIC_NETWORK_INBOUND,
  METRIC_NETWORK_OUTBOUND,
  METRIC_NETWORK_REQUESTS,
  PROJECT,
} from 'src/Utils/constants';
import { ProjectUsageService } from 'src/core/project-usage.service';

@Injectable()
export class ProjectUsageMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProjectUsageMiddleware.name);

  constructor(private readonly projectUsage: ProjectUsageService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const project: Document = req[PROJECT];

    if (project.getId() !== 'console') {
      let responseSize = 0;
      const originalWrite = res.write;
      const originalEnd = res.end;

      res.write = function (chunk: any, ...args: any[]) {
        responseSize += chunk.length;
        return originalWrite.apply(res, [chunk, ...args]);
      };

      res.end = function (chunk: any, ...args: any[]) {
        if (chunk) responseSize += chunk.length;
        return originalEnd.apply(res, [chunk, ...args]);
      };

      res.on('finish', async () => {
        if (res.statusCode >= 500) return; // Ignore failed requests (5xx)
        const fileSize = Array.isArray(req.files)
          ? req.files.reduce((acc, file) => acc + file.size, 0)
          : req.file?.size || 0;

        const inboundSize =
          parseInt(req.headers['content-length'] || '0', 10) + fileSize;
        const outboundSize = responseSize;

        await this.projectUsage.addMetric(METRIC_NETWORK_REQUESTS, 1);
        await this.projectUsage.addMetric(METRIC_NETWORK_INBOUND, inboundSize);
        await this.projectUsage.addMetric(
          METRIC_NETWORK_OUTBOUND,
          outboundSize,
        );
      });
    }

    next();
  }
}
