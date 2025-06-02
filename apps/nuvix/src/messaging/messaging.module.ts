import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { MessagingHook } from '@nuvix/core/resolvers/hooks/messaging.hook';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MessagingHook).forRoutes(MessagingController);
  }
}
