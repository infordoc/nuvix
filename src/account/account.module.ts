import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountResolver } from './account.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, SecuritySettings, Authentication } from './entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, SecuritySettings, Authentication])],
  providers: [AccountResolver, AccountService],
})
export class AccountModule { }
