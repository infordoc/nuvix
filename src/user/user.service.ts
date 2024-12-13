import { Injectable, Type } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { buildQuery } from 'src/Utils/filter.utility';
import { PageInfo } from 'src/base/objects/base.object';
import { UserArgs } from './entities/user.object';
import { GqlResolver } from 'src/Utils/graphql';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) { }

  create(createUserInput: CreateUserInput) {
    return this.userRepository.save(createUserInput);
  }

  async findAll(args: UserArgs) {
    console.log(args.filter)
    let resolver = new GqlResolver(this.userRepository);
    return await resolver.resolveQuery('user', args);
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({ where: { _id: id } });
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
