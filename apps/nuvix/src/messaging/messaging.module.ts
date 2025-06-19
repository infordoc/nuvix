import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { MessagingQueue } from '@nuvix/core/resolvers/queues/messaging.queue';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService, MessagingQueue],
})
export class MessagingModule {}
