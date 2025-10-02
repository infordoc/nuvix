import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { TeamsController } from './teams.controller'
import { BullModule } from '@nestjs/bullmq'
import { QueueFor } from '@nuvix/utils'
import { MembershipsController } from './memberships/memberships.controller'
import { MembershipsService } from './memberships/memberships.service'
import { ApiHook, AuditHook, AuthHook } from '@nuvix/core/resolvers'

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueFor.MAILS },
      { name: QueueFor.STATS },
      { name: QueueFor.AUDITS },
    ),
  ],
  controllers: [TeamsController, MembershipsController],
  providers: [TeamsService, MembershipsService],
})
export class TeamsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthHook, ApiHook, AuditHook)
      .forRoutes(TeamsController, MembershipsController)
  }
}
