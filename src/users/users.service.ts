import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { UserEntity } from 'src/core/entities/users/user.entity';
import Permission from 'src/core/helper/permission.helper';
import Role from 'src/core/helper/role.helper';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name)
  private userRepo: Repository<UserEntity>;

  constructor(
    @Inject('CONNECTION') private readonly dataSource: DataSource,
  ) {
    this.userRepo = this.dataSource.getRepository(UserEntity);
  }

  async ping() {
    let users = await this.userRepo.findAndCount();
    this.logger.verbose('ping', users);
    return users;
  }

}
