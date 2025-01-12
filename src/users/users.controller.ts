import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { CreateTargetDto } from './dto/target.dto';
import { Response } from 'src/core/helper/response.helper';
import { ResolverInterceptor, ResponseType } from 'src/core/resolver/response.resolver';

@Controller({ version: ['1'], path: 'users' })
@UseInterceptors(ResolverInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ResponseType({ type: Response.MODEL_USER, list: true })
  async findAll(
    @Query('queries') queries: string[],
    @Query('search') search: string,
  ) {
    return await this.usersService.findAll(queries, search);
  }

  @Post()
  @ResponseType({ type: Response.MODEL_USER })
  async create(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.usersService.create(createUserDto);
  }

  @Post('argon2')
  @ResponseType({ type: Response.MODEL_USER })
  async createWithArgon2(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.usersService.createWithArgon2(createUserDto);
  }

  @Post('bcrypt')
  @ResponseType({ type: Response.MODEL_USER })
  async createWithBcrypt(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.usersService.createWithBcrypt(createUserDto);
  }

  @Post('md5')
  @ResponseType({ type: Response.MODEL_USER })
  async createWithMd5(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.usersService.createWithMd5(createUserDto);
  }

  @Post('sha')
  @ResponseType({ type: Response.MODEL_USER })
  async createWithSha(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.usersService.createWithSha(createUserDto);
  }

  @Post('phpass')
  @ResponseType({ type: Response.MODEL_USER })
  async createWithPhpass(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.usersService.createWithPhpass(createUserDto);
  }

  @Post('scrypt')
  @ResponseType({ type: Response.MODEL_USER })
  async createWithScrypt(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.usersService.createWithScrypt(createUserDto);
  }

  @Post('scrypt-modified')
  @ResponseType({ type: Response.MODEL_USER })
  async createWithScryptModified(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.usersService.createWithScryptMod(createUserDto);
  }

  @Get('temp/migrate')
  async migrate() {
    return this.usersService.tempDoMigrations();
  }

  @Get('temp/unmigrate')
  async unmigrate() {
    return await this.usersService.tempUndoMigrations();
  }

  @Get(':id')
  @ResponseType({ type: Response.MODEL_USER })
  async findOne(
    @Param('id') id: string
  ) {
    return await this.usersService.findOne(id);
  }

  @Get(':id/prefs')
  async getPrefs(
    @Param('id') id: string
  ) {
    return await this.usersService.getPrefs(id);
  }

  @Post(':id/targets')
  @ResponseType({ type: Response.MODEL_TARGET })
  async addTarget(
    @Param('id') id: string,
    @Body() createTargetDto: CreateTargetDto
  ): Promise<any> {
    return await this.usersService.createTarget(id, createTargetDto);
  }

  @Get(':id/targets')
  @ResponseType({ type: Response.MODEL_TARGET, list: true })
  async getTargets(
    @Param('id') id: string
  ): Promise<any> {
    return await this.usersService.getTargets(id);
  }

  @Get(':id/sessions')
  @ResponseType({ type: Response.MODEL_SESSION, list: true })
  async getSessions(
    @Param('id') id: string
  ): Promise<any> {
    return await this.usersService.getSessions(id);
  }

  @Get(':id/memberships')
  @ResponseType({ type: Response.MODEL_MEMBERSHIP, list: true })
  async getMemberships(
    @Param('id') id: string
  ): Promise<any> {
    return await this.usersService.getMemberships(id);
  }

  @Get(':id/logs')
  @ResponseType({ type: Response.MODEL_LOG, list: true })
  async getLogs(
    @Param('id') id: string
  ): Promise<any> {
    return {
      logs: [],
      total: 0
    }
  }

  @Get(':id/targets/:targetId')
  @ResponseType({ type: Response.MODEL_TARGET })
  async getTarget(
    @Param('id') id: string,
    @Param('targetId') targetId: string
  ): Promise<any> {
    return await this.usersService.getTarget(id, targetId);
  }

  @Get(':id/mfa/factors')
  @ResponseType({ type: Response.MODEL_MFA_FACTORS })
  /**
   * @todo ....
   */
  async getMfaFactors(
    @Param('id') id: string,
  ) {
    return {
      totp: false,
      email: true,
      phone: true,
      recoveryCode: false
    }
  }

}
