import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { SchemaHook } from '@nuvix/core/resolvers/hooks/schema.hook';
import { BullModule } from '@nestjs/bullmq';
import { SchemaQueue } from '@nuvix/core/resolvers/queues/schema.queue';

@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService, SchemaQueue],
  imports: [
    BullModule.registerQueue({
      name: 'schema',
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 2,
      },
    }),
  ],
})
export class DatabaseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SchemaHook).forRoutes(DatabaseController);
  }
}
