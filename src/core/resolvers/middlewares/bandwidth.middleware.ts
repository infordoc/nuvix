import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { Request, Response, NextFunction } from 'express';
import {
  CACHE_DB,
  METRIC_NETWORK_INBOUND,
  METRIC_NETWORK_OUTBOUND,
  METRIC_NETWORK_REQUESTS,
  PROJECT,
  WORKER_TYPE_USAGE,
} from 'src/Utils/constants';
import { Redis } from 'ioredis';
import { MetricsHelper } from 'src/core/helper/metrics.helper';

@Injectable()
export class BandwidthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BandwidthMiddleware.name);

  constructor(@Inject(CACHE_DB) private readonly cacheDb: Redis) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const project: Document = req[PROJECT];

    if (project.getId() !== 'console') {
      const startTime = process.hrtime();

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
        const fileSize = Array.isArray(req.files)
          ? req.files.reduce((acc, file) => acc + file.size, 0)
          : req.file?.size || 0;
        const requestSize =
          parseInt(req.headers['content-length'] || '0', 10) + fileSize;
        const outboundSize = responseSize;
        const queueForUsage = new MetricsHelper(this.cacheDb);

        queueForUsage
          .addMetric(METRIC_NETWORK_REQUESTS, 1)
          .addMetric(METRIC_NETWORK_INBOUND, requestSize)
          .addMetric(METRIC_NETWORK_OUTBOUND, outboundSize);
      });
    }

    next();
  }
}
