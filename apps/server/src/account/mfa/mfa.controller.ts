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
  Req,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Database } from '@nuvix/db';
import { AuditEvent, Scope, Sdk, Throttle } from '@nuvix/core/decorators';
import { Locale } from '@nuvix/core/decorators/locale.decorator';
import { ResModel } from '@nuvix/core/decorators/res-model.decorator';
import {
  AuthDatabase,
  Project,
} from '@nuvix/core/decorators/project.decorator';
import { User } from '@nuvix/core/decorators/project-user.decorator';
import { Exception } from '@nuvix/core/extend/exception';
import { LocaleTranslator } from '@nuvix/core/helper/locale.helper';
import { Models } from '@nuvix/core/helper/response.helper';
import { ProjectGuard } from '@nuvix/core/resolvers/guards';
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor';
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor';
import { MfaService } from './mfa.service';
import {
  CreateMfaChallengeDTO,
  MfaAuthenticatorTypeParamDTO,
  UpdateAccountMfaDTO,
  VerifyMfaChallengeDTO,
  VerifyMfaAuthenticatorDTO,
} from './DTO/mfa.dto';
import type { ProjectsDoc, SessionsDoc, UsersDoc } from '@nuvix/utils/types';

@Controller({ version: ['1'], path: 'account/mfa' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Patch()
  @Scope('account')
  @AuditEvent('user.update', {
    resource: 'user/{res.$id}',
    userId: '{res.$id}',
  })
  @ResModel(Models.ACCOUNT)
  @Sdk({
    name: 'updateMfa',
  })
  async updateMfa(
    @Body() { mfa }: UpdateAccountMfaDTO,
    @User() user: UsersDoc,
    @Session() session: SessionsDoc,
    @AuthDatabase() db: Database,
  ) {
    return this.mfaService.updateMfa({
      mfa,
      session,
      user,
      db,
    });
  }

  @Get('factors')
  @Scope('account')
  @ResModel(Models.MFA_FACTORS)
  @Sdk({
    name: 'listMfaFactors',
  })
  async getMfaFactors(@User() user: UsersDoc) {
    return this.mfaService.getMfaFactors(user);
  }

  @Post('authenticators/:type')
  @Scope('account')
  @AuditEvent('user.update', {
    resource: 'user/{res.$id}',
    userId: '{res.$id}',
  })
  @ResModel(Models.MFA_TYPE)
  @Sdk({
    name: 'createMfaAuthenticator',
  })
  async createMfaAuthenticator(
    @Param() { type }: MfaAuthenticatorTypeParamDTO,
    @Project() project: ProjectsDoc,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
  ) {
    return this.mfaService.createMfaAuthenticator({
      type,
      project,
      user,
      db,
    });
  }

  @Put('authenticators/:type')
  @Scope('account')
  @AuditEvent('user.update', {
    resource: 'user/{res.$id}',
    userId: '{res.$id}',
  })
  @ResModel(Models.ACCOUNT)
  @Sdk({
    name: 'updateMfaAuthenticator',
  })
  async verifyMfaAuthenticator(
    @Param() { type }: MfaAuthenticatorTypeParamDTO,
    @Body() { otp }: VerifyMfaAuthenticatorDTO,
    @User() user: UsersDoc,
    @Session() session: SessionsDoc,
    @AuthDatabase() db: Database,
  ) {
    return this.mfaService.verifyMfaAuthenticator({
      type,
      otp,
      user,
      session,
      db,
    });
  }

  @Post('recovery-codes')
  @Scope('account')
  @AuditEvent('user.update', {
    resource: 'user/{res.$id}',
    userId: '{res.$id}',
  })
  @ResModel(Models.MFA_RECOVERY_CODES)
  @Sdk({
    name: 'createMfaRecoveryCodes',
  })
  async createMfaRecoveryCodes(
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
  ) {
    return this.mfaService.createMfaRecoveryCodes({ user, db });
  }

  @Patch('recovery-codes')
  @Scope('account')
  @AuditEvent('user.update', {
    resource: 'user/{res.$id}',
    userId: '{res.$id}',
  })
  @ResModel(Models.MFA_RECOVERY_CODES)
  @Sdk({
    name: 'updateMfaRecoveryCodes',
  })
  async updateMfaRecoveryCodes(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
  ) {
    return this.mfaService.updateMfaRecoveryCodes({ db, user });
  }

  @Get('recovery-codes')
  @Scope('account')
  @ResModel(Models.MFA_RECOVERY_CODES)
  @Sdk({
    name: 'getMfaRecoveryCodes',
  })
  async getMfaRecoveryCodes(@User() user: UsersDoc) {
    const mfaRecoveryCodes = user.get('mfaRecoveryCodes', []);

    if (!mfaRecoveryCodes || mfaRecoveryCodes.length === 0) {
      throw new Exception(Exception.USER_RECOVERY_CODES_NOT_FOUND);
    }

    return {
      recoveryCodes: mfaRecoveryCodes,
    };
  }

  @Delete('authenticators/:type')
  @Scope('account')
  @AuditEvent('user.update', {
    resource: 'user/{res.$id}',
    userId: '{res.$id}',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResModel(Models.NONE)
  @Sdk({
    name: 'deleteMfaAuthenticator',
  })
  async deleteMfaAuthenticator(
    @Param() { type }: MfaAuthenticatorTypeParamDTO,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
  ) {
    return this.mfaService.deleteMfaAuthenticator({
      type,
      user,
      db,
    });
  }

  @Post('challenge')
  @Scope('account')
  @Throttle({
    limit: 10,
    key: 'ip:{ip},userId:{userId}',
  })
  @ResModel(Models.MFA_CHALLENGE)
  @Sdk({
    name: 'createMfaChallenge',
  })
  async createMfaChallenge(
    @Body() input: CreateMfaChallengeDTO,
    @Req() request: NuvixRequest,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
    @Project() project: ProjectsDoc,
    @Locale() locale: LocaleTranslator,
  ) {
    return this.mfaService.createMfaChallenge({
      ...input,
      userAgent: request.headers['user-agent'] || 'UNKNOWN',
      user,
      db,
      project,
      locale,
    });
  }

  @Put('challenge')
  @Scope('account')
  @ResModel(Models.SESSION)
  @Throttle({
    limit: 10,
    key: 'challengeId:{param-challengeId}',
  })
  @Sdk({
    name: 'updateMfaChallenge',
  })
  async updateMfaChallenge(
    @Body() input: VerifyMfaChallengeDTO,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
    @Session() session: SessionsDoc,
  ) {
    return this.mfaService.updateMfaChallenge({
      ...input,
      user,
      db,
      session,
    });
  }
}
