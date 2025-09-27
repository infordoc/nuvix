import {
  Body,
  Controller,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Database } from '@nuvix/db'
import { AuthType, Namespace } from '@nuvix/core/decorators'
import { Locale } from '@nuvix/core/decorators/locale.decorator'
import { AuthDatabase, Project } from '@nuvix/core/decorators/project.decorator'
import { User } from '@nuvix/core/decorators/project-user.decorator'
import { Exception } from '@nuvix/core/extend/exception'
import { LocaleTranslator } from '@nuvix/core/helper/locale.helper'
import { Models } from '@nuvix/core/helper/response.helper'
import { ProjectGuard } from '@nuvix/core/resolvers/guards'
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor'
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor'
import { AccountService } from './account.service'
import {
  CreateAccountDTO,
  UpdateEmailDTO,
  UpdateNameDTO,
  UpdatePasswordDTO,
  UpdatePhoneDTO,
  UpdatePrefsDTO,
} from './DTO/account.dto'
import {
  CreateEmailVerificationDTO,
  UpdateEmailVerificationDTO,
  UpdatePhoneVerificationDTO,
} from './DTO/verification.dto'
import type { ProjectsDoc, UsersDoc } from '@nuvix/utils/types'
import { Delete, Get, Patch, Post, Put } from '@nuvix/core'

@Controller({ version: ['1'], path: 'account' })
@Namespace('account')
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('', {
    summary: 'Create Account',
    tags: ['sessions'],
    public: true,
    scopes: 'sessions.create',
    throttle: 10,
    resModel: Models.ACCOUNT,
    audit: {
      key: 'user.create',
      resource: 'user/{res.$id}',
      userId: '{res.$id}',
    },
    sdk: {
      name: 'createAccount',
      descMd: 'docs/references/account/create-account.md',
    },
  })
  async createAccount(
    @AuthDatabase() db: Database,
    @Body() input: CreateAccountDTO,
    @User() user: UsersDoc,
    @Project() project: ProjectsDoc,
  ) {
    return this.accountService.createAccount(
      db,
      input.userId,
      input.email,
      input.password,
      input.name,
      user,
      project,
    )
  }

  @Get('', {
    summary: 'Get Account',
    tags: ['sessions'],
    scopes: 'account',
    auth: AuthType.SESSION,
    resModel: Models.ACCOUNT,
  })
  async getAccount(@User() user: UsersDoc) {
    if (user.empty()) {
      throw new Exception(Exception.USER_NOT_FOUND)
    }
    return user
  }

  @Delete('', {
    scopes: 'account',
    resModel: Models.NONE,
    audit: {
      key: 'user.delete',
      resource: 'user/{res.$id}',
    },
  })
  async deleteAccount(@AuthDatabase() db: Database, @User() user: UsersDoc) {
    return this.accountService.deleteAccount(db, user)
  }

  @Post(['jwts', 'jwt'], {
    summary: 'Create JWT',
    tags: ['sessions'],
    scopes: 'account',
    auth: AuthType.JWT,
    throttle: {
      limit: 100,
      key: 'userId:{userId}',
    },
    sdk: {
      name: 'createJWT',
      descMd: 'docs/references/account/create-jwt.md',
    },
  })
  async createJWT(
    @User() user: UsersDoc,
    @Res({ passthrough: true }) response: NuvixRes,
  ) {
    return this.accountService.createJWT(user, response)
  }

  @Get('prefs', {
    scopes: 'account',
    resModel: Models.PREFERENCES,
  })
  getPrefs(@User() user: UsersDoc) {
    return user.get('prefs', {})
  }

  @Patch('prefs', {
    scopes: 'account',
    resModel: Models.PREFERENCES,
    audit: {
      key: 'user.update',
      resource: 'user/{res.$id}',
    },
  })
  async updatePrefs(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() input: UpdatePrefsDTO,
  ) {
    return this.accountService.updatePrefs(db, user, input.prefs)
  }

  @Patch('name', {
    scopes: 'account',
    resModel: Models.ACCOUNT,
    audit: {
      key: 'user.update',
      resource: 'user/{res.$id}',
    },
    sdk: {
      name: 'updateName',
    },
  })
  async updateName(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() { name }: UpdateNameDTO,
  ) {
    return this.accountService.updateName(db, name, user)
  }

  @Patch('password', {
    scopes: 'account',
    throttle: 10,
    resModel: Models.ACCOUNT,
    audit: {
      key: 'user.update',
      resource: 'user/{res.$id}',
    },
    sdk: {
      name: 'updatePassword',
    },
  })
  async updatePassword(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() { password, oldPassword }: UpdatePasswordDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.accountService.updatePassword({
      db: db,
      password,
      oldPassword,
      user,
      project,
    })
  }

  @Patch('email', {
    scopes: 'account',
    resModel: Models.ACCOUNT,
    audit: {
      key: 'user.update',
      resource: 'user/{res.$id}',
    },
  })
  async updateEmail(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() updateEmailDTO: UpdateEmailDTO,
  ) {
    return this.accountService.updateEmail(db, user, updateEmailDTO)
  }

  @Patch('phone', {
    scopes: 'account',
    resModel: Models.ACCOUNT,
    audit: {
      key: 'user.update',
      resource: 'user/{res.$id}',
    },
    sdk: {
      name: 'updatePhone',
    },
  })
  async updatePhone(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() { password, phone }: UpdatePhoneDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.accountService.updatePhone({
      db: db,
      password,
      phone,
      user,
      project,
    })
  }

  @Patch('status', {
    scopes: 'account',
    resModel: Models.ACCOUNT,
    audit: {
      key: 'user.update',
      resource: 'user/{res.$id}',
    },
    sdk: {
      name: 'updateStatus',
    },
  })
  async updateStatus(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
  ) {
    return this.accountService.updateStatus({
      db: db,
      user,
      request,
      response,
    })
  }

  @Post('verification', {
    scopes: 'account',
    throttle: {
      limit: 10,
      key: 'ip:{ip},userId:{param-userId}',
    },
    audit: {
      key: 'verification.create',
      resource: 'user/{res.userId}',
      userId: '{res.userId}',
    },
    resModel: Models.TOKEN,
    sdk: {
      name: 'createVerification',
    },
  })
  async createEmailVerification(
    @Body() { url }: CreateEmailVerificationDTO,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Project() project: ProjectsDoc,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
    @Locale() locale: LocaleTranslator,
  ) {
    return this.accountService.createEmailVerification({
      url,
      request,
      response,
      project,
      user,
      db,
      locale,
    })
  }

  @Put('verification', {
    public: true,
    scopes: 'public',
    throttle: {
      limit: 10,
      key: 'ip:{ip},userId:{param-userId}',
    },
    audit: {
      key: 'verification.update',
      resource: 'user/{res.userId}',
      userId: '{res.userId}',
    },
    resModel: Models.TOKEN,
    sdk: {
      name: 'updateEmailVerification',
    },
  })
  async updateEmailVerification(
    @Body() { userId, secret }: UpdateEmailVerificationDTO,
    @Res({ passthrough: true }) response: NuvixRes,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
  ) {
    return this.accountService.updateEmailVerification({
      userId,
      secret,
      response,
      user,
      db,
    })
  }

  @Post('verification/phone', {
    scopes: 'account',
    throttle: {
      limit: 10,
      key: 'ip:{ip},userId:{param-userId}',
    },
    audit: {
      key: 'verification.create',
      resource: 'user/{res.userId}',
      userId: '{res.userId}',
    },
    resModel: Models.TOKEN,
    sdk: {
      name: 'createPhoneVerification',
    },
  })
  async createPhoneVerification(
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
    @Project() project: ProjectsDoc,
    @Locale() locale: LocaleTranslator,
  ) {
    return this.accountService.createPhoneVerification({
      request,
      response,
      user,
      db,
      project,
      locale,
    })
  }

  @Put('verification/phone', {
    public: true,
    scopes: 'public',
    throttle: {
      limit: 10,
      key: 'ip:{ip},userId:{param-userId}',
    },
    audit: {
      key: 'verification.update',
      resource: 'user/{res.userId}',
      userId: '{res.userId}',
    },
    resModel: Models.TOKEN,
    sdk: {
      name: 'updatePhoneVerification',
    },
  })
  async updatePhoneVerification(
    @Body() { userId, secret }: UpdatePhoneVerificationDTO,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
  ) {
    return this.accountService.updatePhoneVerification({
      userId,
      secret,
      user,
      db,
    })
  }
}
