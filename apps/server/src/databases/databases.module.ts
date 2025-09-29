import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { DatabasesService } from './databases.service'
import { DatabasesController } from './databases.controller'
import { BullModule } from '@nestjs/bullmq'
import { DatabasesQueue } from '@nuvix/core/resolvers/queues/databases.queue'
import { QueueFor } from '@nuvix/utils'
import { AuthHook, ApiHook, StatsHook, AuditHook } from '@nuvix/core/resolvers'

@Module({
  controllers: [DatabasesController],
  providers: [DatabasesService, DatabasesQueue],
  imports: [
    BullModule.registerQueue(
      {
        name: QueueFor.DATABASES,
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 2,
        },
      },
      { name: QueueFor.STATS },
      { name: QueueFor.AUDITS },
    ),
  ],
})
export class DatabasesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthHook, ApiHook, StatsHook, AuditHook)
      .forRoutes(DatabasesController)
  }
}
