import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Hook } from '@nuvix/core/server';
import { Document } from '@nuvix/database';
import { PROJECT, QueueFor } from '@nuvix/utils/constants';
import type { Queue } from 'bullmq';

@Injectable()
export class LogsHook implements Hook {
  constructor(@InjectQueue(QueueFor.LOGS) private readonly logsQueue: Queue) {}

  async onResponse(
    req: NuvixRequest,
    reply: NuvixRes,
    next: (err?: Error) => void,
  ) {
    const project = req[PROJECT] ?? new Document({ $id: 'console' });
    // TODO: queue api logs
    return;
  }
}
