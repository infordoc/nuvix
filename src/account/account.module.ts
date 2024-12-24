import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Identities, IdentitiesSchema, Session, SessionSchema } from './schemas/account.schema';

@Module({
  controllers: [AccountController],
  providers: [AccountService],
  imports: [
    MongooseModule.forFeature([
      { name: Identities.name, schema: IdentitiesSchema },
      { name: Session.name, schema: SessionSchema },
    ], 'server')
  ]
})
export class AccountModule { }
