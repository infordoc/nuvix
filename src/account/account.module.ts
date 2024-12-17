import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountResolver } from './account.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, SecuritySettings, Authentication } from './entities/account.entity';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWT_SECRET } from 'src/Utils/constants';
import { Session } from 'src/session/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, SecuritySettings, Authentication, User, Session]),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    })
  ],
  providers: [AccountResolver, AccountService, JwtStrategy],
  controllers: [AccountController],
})
export class AccountModule { }
