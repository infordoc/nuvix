import { Module } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { TeamsController } from './teams.controller'
import { BullModule } from '@nestjs/bullmq'
import { QueueFor } from '@nuvix/utils'
import { MembershipsController } from './memberships/memberships.controller'
import { MembershipsService } from './memberships/memberships.service'

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
export class TeamsModule {}
