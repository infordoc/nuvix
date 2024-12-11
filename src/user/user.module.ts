import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Role, Permission, AuditLog, UserRole } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, AuditLog, UserRole])],
  providers: [UserResolver, UserService],
})
export class UserModule { }