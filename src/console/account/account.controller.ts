import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AccountService } from './account.service';
import { ResponseType } from 'src/core/resolver/response.resolver';
import { Response } from 'src/core/helper/response.helper';
import { User } from 'src/core/resolver/user.resolver';
import { Document } from '@nuvix/database';
import { CreateAccountDTO } from './DTO/account.dto';
import { Exception } from 'src/core/extend/exception';

@Controller({ version: ['1'], path: 'console/account' })
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @Post()
  @ResponseType({ type: Response.MODEL_USER })
  async createAccount(
    @Body() input: CreateAccountDTO,
    @User() user: Document,
    @Request() req: any,
  ) {
    return await this.accountService.createAccount(
      input.userId,
      input.email,
      input.password,
      input.name,
      req,
      user,
    );
  }

  @Get()
  @ResponseType({ type: Response.MODEL_USER })
  async getAccount(@User() user: Document) {
    if (user.isEmpty()) {
      throw new Exception(Exception.USER_NOT_FOUND);
    }

    return user;
  }
}
