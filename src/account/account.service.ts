import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AccountService {
  create(createAccountDto: CreateAccountDto) {
    return 'This action adds a new account';
  }

  findAll() {
    return `This action returns all account`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  login(loginDto: LoginDto) {
    return `This action logs in an account`;
  }

  register(registerDto: RegisterDto) {
    return `This action registers an account`;
  }
}
