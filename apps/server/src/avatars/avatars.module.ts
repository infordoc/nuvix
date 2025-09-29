import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AvatarsService } from './avatars.service'
import { AvatarsController } from './avatars.controller'
import { ApiHook, AuditHook, AuthHook, StatsHook } from '@nuvix/core/resolvers'
import { BullModule } from '@nestjs/bullmq'
import { QueueFor } from '@nuvix/utils'

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueFor.STATS },
      { name: QueueFor.AUDITS },
    ),
  ],
  controllers: [AvatarsController],
  providers: [AvatarsService],
})
export class AvatarsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthHook, ApiHook, StatsHook, AuditHook)
      .forRoutes(AvatarsController)
  }
}
