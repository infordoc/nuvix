import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Identities, IdentitiesSchema, Session, SessionSchema } from './schemas/account.schema';
import { UserService } from 'src/user/user.service';
import { Organization, OrganizationSchema, User, UserSchema } from 'src/user/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/Utils/constants';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { APP_GUARD } from '@nestjs/core';

@Module({
  controllers: [AccountController],
  providers: [JwtStrategy, AccountService, UserService, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  }],
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    MongooseModule.forFeature([
      { name: Identities.name, schema: IdentitiesSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Organization.name, schema: OrganizationSchema },
      {
        name: User.name,
        schema: UserSchema,
      }
    ], 'server')
  ]
})
export class AccountModule { }
