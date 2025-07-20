import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseHook } from '@nuvix/core/resolvers/hooks/database.hook';
import { SchemasQueue } from '@nuvix/core/resolvers/queues';
import { QueueFor } from '@nuvix/utils/constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueFor.SCHEMAS,
    }),
  ],
  controllers: [DatabaseController],
  providers: [DatabaseService, SchemasQueue],
})
export class DatabaseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DatabaseHook).forRoutes(DatabaseController);
  }
}
