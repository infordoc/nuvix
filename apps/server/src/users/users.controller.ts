import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { UsersService } from './users.service'
import {
  CreateUserDTO,
  UpdateUserEmailDTO,
  UpdateUserEmailVerificationDTO,
  UpdateUserLabelDTO,
  UpdateUserNameDTO,
  UpdateUserPasswordDTO,
  UpdateUserPhoneDTO,
  UpdateUserPoneVerificationDTO,
  UpdateUserPrefsDTO,
  UpdateUserStatusDTO,
} from './DTO/user.dto'
import { Models } from '@nuvix/core/helper/response.helper'
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor'
import {
  AuditEvent,
  Namespace,
  Project,
  ResModel,
  Scope,
  AuthType,
  AuthDatabase,
  Locale,
  Route,
  Auth,
} from '@nuvix/core/decorators'
import { CreateTokenDTO } from './DTO/token.dto'
import { CreateJwtDTO } from './DTO/jwt.dto'
import type { Database, Query as Queries } from '@nuvix/db'
import { ProjectGuard } from '@nuvix/core/resolvers/guards/project.guard'
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor'
import type { ProjectsDoc } from '@nuvix/utils/types'
import {
  IdentitiesQueryPipe,
  LogsQueryPipe,
  UsersQueryPipe,
} from '@nuvix/core/pipes/queries'
import type { LocaleTranslator } from '@nuvix/core/helper'

@Namespace('users')
@Controller({ version: ['1'], path: 'users' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
@Auth([AuthType.ADMIN, AuthType.KEY])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Scope('users.read')
  @Route()
  @ResModel(Models.USER, { list: true })
  async findAll(
    @AuthDatabase() db: Database,
    @Query('queries', UsersQueryPipe) queries?: Queries[],
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(db, queries, search)
  }

  @Post()
  @Scope('users.create')
  @Route()
  @ResModel(Models.USER)
  @AuditEvent('user.create', 'user/{res.$id}')
  async create(
    @AuthDatabase() db: Database,
    @Body() createUserDTO: CreateUserDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.create(db, createUserDTO, project)
  }

  @Post('argon2')
  @Scope('users.create')
  @Route()
  @ResModel(Models.USER)
  @AuditEvent('user.create', 'user/{res.$id}')
  async createWithArgon2(
    @AuthDatabase() db: Database,
    @Body() createUserDTO: CreateUserDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.createWithArgon2(db, createUserDTO, project)
  }

  @Post('bcrypt')
  @Scope('users.create')
  @Route()
  @ResModel(Models.USER)
  @AuditEvent('user.create', 'user/{res.$id}')
  async createWithBcrypt(
    @AuthDatabase() db: Database,
    @Body() createUserDTO: CreateUserDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.createWithBcrypt(db, createUserDTO, project)
  }

  @Post('md5')
  @Scope('users.create')
  @Route()
  @ResModel(Models.USER)
  @AuditEvent('user.create', 'user/{res.$id}')
  async createWithMd5(
    @AuthDatabase() db: Database,
    @Body() createUserDTO: CreateUserDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.createWithMd5(db, createUserDTO, project)
  }

  @Post('sha')
  @Scope('users.create')
  @Route()
  @ResModel(Models.USER)
  @AuditEvent('user.create', 'user/{res.$id}')
  async createWithSha(
    @AuthDatabase() db: Database,
    @Body() createUserDTO: CreateUserDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.createWithSha(db, createUserDTO, project)
  }

  @Post('phpass')
  @Scope('users.create')
  @Route()
  @ResModel(Models.USER)
  @AuditEvent('user.create', 'user/{res.$id}')
  async createWithPhpass(
    @AuthDatabase() db: Database,
    @Body() createUserDTO: CreateUserDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.createWithPhpass(db, createUserDTO, project)
  }

  @Post('scrypt')
  @Scope('users.create')
  @Route()
  @ResModel(Models.USER)
  @AuditEvent('user.create', 'user/{res.$id}')
  async createWithScrypt(
    @AuthDatabase() db: Database,
    @Body() createUserDTO: CreateUserDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.createWithScrypt(db, createUserDTO, project)
  }

  @Post('scrypt-modified')
  @Scope('users.create')
  @Route()
  @ResModel(Models.USER)
  @AuditEvent('user.create', 'user/{res.$id}')
  async createWithScryptModified(
    @AuthDatabase() db: Database,
    @Body() createUserDTO: CreateUserDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.createWithScryptMod(db, createUserDTO, project)
  }

  @Get('usage')
  @ResModel({ type: Models.USAGE_USERS })
  async getUsage(@AuthDatabase() db: Database) {
    return this.usersService.getUsage(db)
  }

  @Get('identities')
  @Scope('users.read')
  @ResModel({ type: Models.IDENTITY, list: true })
  async getIdentities(
    @AuthDatabase() db: Database,
    @Query('queries', IdentitiesQueryPipe) queries?: Queries[],
    @Query('search') search?: string,
  ) {
    return this.usersService.getIdentities(db, queries, search)
  }

  @Delete('identities/:id')
  @Scope('users.read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIdentity(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.usersService.deleteIdentity(db, id)
  }

  @Get(':id')
  @Scope('users.read')
  @ResModel(Models.USER)
  async findOne(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.usersService.findOne(db, id)
  }

  @Get(':id/prefs')
  @Scope('users.read')
  @ResModel(Models.PREFERENCES)
  async getPrefs(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.usersService.getPrefs(db, id)
  }

  @Patch(':id/prefs')
  @Scope('users.update')
  @ResModel(Models.USER)
  async updatePrefs(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() { prefs }: UpdateUserPrefsDTO,
  ) {
    return this.usersService.updatePrefs(db, id, prefs)
  }

  @Patch(':id/status')
  @Scope('users.update')
  @ResModel({ type: Models.USER })
  async updateStatus(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() status: UpdateUserStatusDTO,
  ) {
    return this.usersService.updateStatus(db, id, status)
  }

  @Put(':id/labels')
  @Scope('users.update')
  @ResModel({ type: Models.USER })
  async updateLabels(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateUserLabelDTO,
  ) {
    return this.usersService.updateLabels(db, id, input)
  }

  @Patch(':id/name')
  @Scope('users.update')
  @ResModel({ type: Models.USER })
  async updateName(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateUserNameDTO,
  ) {
    return this.usersService.updateName(db, id, input)
  }

  @Patch(':id/password')
  @ResModel({ type: Models.USER })
  async updatePassword(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateUserPasswordDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.usersService.updatePassword(db, id, input, project)
  }

  @Patch(':id/email')
  @ResModel({ type: Models.USER })
  async updateEmail(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateUserEmailDTO,
  ) {
    return this.usersService.updateEmail(db, id, input.email)
  }

  @Patch(':id/phone')
  @ResModel({ type: Models.USER })
  async updatePhone(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateUserPhoneDTO,
  ) {
    return this.usersService.updatePhone(db, id, input.phone)
  }

  @Post(':id/jwts')
  @ResModel({ type: Models.JWT })
  async createJwt(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: CreateJwtDTO,
  ): Promise<any> {
    return this.usersService.createJwt(db, id, input)
  }

  @Get(':id/memberships')
  @ResModel({ type: Models.MEMBERSHIP, list: true })
  async getMemberships(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
  ): Promise<any> {
    return this.usersService.getMemberships(db, id)
  }

  @Post(':id/tokens')
  @ResModel({ type: Models.TOKEN })
  async createToken(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: CreateTokenDTO,
    @Req() req: NuvixRequest,
  ): Promise<any> {
    return this.usersService.createToken(
      db,
      id,
      input,
      req.headers['user-agent'] ?? 'UNKNOWN',
      req.ip,
    )
  }

  @Get(':id/logs')
  @ResModel({ type: Models.LOG, list: true })
  async getLogs(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Locale() locale: LocaleTranslator,
    @Query('queries', LogsQueryPipe) queries?: Queries[],
  ): Promise<any> {
    return this.usersService.getLogs(db, id, locale, queries)
  }

  @Patch(':id/verification')
  @ResModel({ type: Models.USER })
  async verify(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateUserEmailVerificationDTO,
  ) {
    return this.usersService.updateEmailVerification(db, id, input)
  }

  @Patch(':id/verification/phone')
  @ResModel({ type: Models.USER })
  async verifyPhone(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateUserPoneVerificationDTO,
  ) {
    return this.usersService.updatePhoneVerification(db, id, input)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.usersService.remove(db, id)
  }
}
