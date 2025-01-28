import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class AppService {
  constructor() {} // @InjectQueue('test') private testQueue: Queue

  async getHello(): Promise<string> {
    return 'Hello World!';
  }
}
