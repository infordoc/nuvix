import { Processor } from '@nestjs/bullmq';
import { Queue } from './queue';
import {
  createMd5Hash,
  MetricFor,
  MetricPeriod,
  QueueFor,
  Schemas,
} from '@nuvix/utils';
import { Job } from 'bullmq';
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Doc } from '@nuvix-tech/db';
import { CoreService } from '@nuvix/core/core.service.js';
import type { ProjectsDoc, Stats } from '@nuvix/utils/types';
import { AppConfigService } from '@nuvix/core/config.service';

@Processor(QueueFor.STATS, {
  concurrency: 10000,
})
export class StatsQueue extends Queue implements OnModuleInit, OnModuleDestroy {
  private static readonly BATCH_SIZE = 1000;
  private static readonly BATCH_INTERVAL_MS = 1000;
  private readonly logger = new Logger(StatsQueue.name);
  private buffer = new Map<number, StatsBuffer>();
  private interval!: NodeJS.Timeout;

  private static periods = [
    MetricPeriod.INF,
    MetricPeriod.HOUR,
    MetricPeriod.DAY,
  ] as const;

  constructor(
    private readonly coreService: CoreService,
    private readonly appConfig: AppConfigService,
  ) {
    super();
  }

  onModuleInit() {
    this.startTimer();
  }

  async onModuleDestroy() {
    this.logger.log('Module destroying. Flushing remaining stats...');
    clearInterval(this.interval);
    await this.flushBuffer();
  }

  private startTimer(): void {
    this.interval = setInterval(
      () => this.flushBuffer(),
      StatsQueue.BATCH_INTERVAL_MS,
    );
  }

  private async flushBuffer(): Promise<void> {
    if (this.buffer.size === 0) {
      return;
    }

    const bufferCopy = new Map(this.buffer);
    this.buffer.clear();

    for (const [projectId, data] of bufferCopy.entries()) {
      if (Object.keys(data.keys).length === 0) {
        continue;
      }

      const { project, keys, receivedAt } = data;
      const { client, dbForProject } =
        await this.coreService.createProjectDatabase(project, {
          schema: Schemas.Core,
        });

      try {
        const entries = Object.entries(keys);
        const stats: Doc<Stats>[] = [];

        // Process each metric key-value pair
        for (const [key, value] of entries as [MetricFor, number][]) {
          if (value === 0) continue;
          this.logger.debug(`${key} processing with value ${value}`);

          for (const period of StatsQueue.periods) {
            const time = StatsQueue.formatDate(period, receivedAt);
            const id = createMd5Hash(`${time}|${period}|${key}`);

            const doc = new Doc<Stats>({
              $id: id,
              time,
              period,
              metric: key,
              value,
              region: this.appConfig.get('app').region,
            });

            stats.push(doc);
          }
        }

        // Bulk insert/update stats
        if (stats.length > 0) {
          try {
            this.logger.log(
              `Flushing ${stats.length} stats logs for project ${projectId}`,
            );
            await dbForProject.createOrUpdateDocumentsWithIncrease(
              'stats',
              'value',
              stats,
            );
          } catch (error) {
            this.logger.error(
              `Error creating/updating stats logs for project ${projectId}:`,
              error,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `Error flushing stats logs for project ${projectId}:`,
          error,
        );
        // Re-add failed logs to buffer for retry
        // const currentBuffer = this.buffer.get(projectId) || {
        //   project: data.project,
        //   keys: {},
        // };
        // currentBuffer.keys.push(...data.logs);
        // this.buffer.set(projectId, currentBuffer);
      } finally {
        await this.coreService.releaseDatabaseClient(client);
      }
    }
  }

  async process(job: Job<StatsQueueOptions, any, MetricFor>): Promise<any> {
    const { value } = job.data;
    const matric = job.name;
    const project = new Doc(job.data.project);
    const projectId = project.getSequence();

    if (!this.buffer.has(projectId)) {
      this.buffer.set(projectId, {
        project: new Doc({
          $id: project.getId(),
          $sequence: projectId,
          database: project.get('database'),
        }) as unknown as ProjectsDoc,
        keys: {},
        receivedAt: new Date(),
      });
    }

    // TODO: ---- we have to reduce here

    const meta = this.buffer.get(projectId)!;
    if (Object.hasOwn(meta.keys, matric)) {
      meta.keys[matric] = meta.keys[matric]! + value;
    } else {
      meta.keys[matric] = value;
    }

    if (
      Object.keys(this.buffer.get(projectId)!.keys).length >=
      StatsQueue.BATCH_SIZE
    ) {
      // Temporarily stop the timer to avoid a race condition where the timer
      // and a full buffer try to flush at the same exact time.
      clearInterval(this.interval);
      await this.flushBuffer();
      this.startTimer();
    }

    return;
  }

  public static formatDate(period: MetricPeriod, date: Date): string | null {
    switch (period) {
      case MetricPeriod.INF:
        return null;
      case MetricPeriod.HOUR:
        return date.toISOString().slice(0, 13) + ':00:00Z';
      case MetricPeriod.DAY:
        return date.toISOString().slice(0, 10) + 'T00:00:00Z';
      default:
        throw new Error(`Unsupported period: ${period}`);
    }
  }
}

export interface StatsQueueOptions {
  project: object;
  value: number;
}

interface StatsBuffer {
  project: ProjectsDoc;
  receivedAt: Date;
  keys: Record<string, number>;
}
