import { Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { BullModule } from '@nestjs/bullmq'
import { QueueFor } from '@nuvix/utils'

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QueueFor.MAILS,
      },
      { name: QueueFor.STATS },
      { name: QueueFor.AUDITS },
    ),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
