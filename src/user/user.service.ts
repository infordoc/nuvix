import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name, 'server')
    private readonly catModel: Model<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    let password = await this.hashPassword(createUserDto.password);
    createUserDto.password = password;
    let user = this.catModel.create(createUserDto);
    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async hashPassword(password: string) {
    const saltRounds = 12;  // Higher is more secure but slower
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async comparePasswords(newPassword: string, oldPassword: string) {
    return await bcrypt.compare(newPassword, oldPassword);
  }
}
