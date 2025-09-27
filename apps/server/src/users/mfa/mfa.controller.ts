import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { MfaService } from './mfa.service'
import { UpdateMfaStatusDTO } from './DTO/mfa.dto'
import { Models } from '@nuvix/core/helper/response.helper'
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor'
import {
  Namespace,
  ResModel,
  AuthDatabase,
  Auth,
  AuthType,
} from '@nuvix/core/decorators'

import type { Database } from '@nuvix/db'
import { ProjectGuard } from '@nuvix/core/resolvers/guards/project.guard'
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor'

@Namespace('users')
@Controller({ version: ['1'], path: 'users/:id/mfa' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
@Auth([AuthType.ADMIN, AuthType.KEY])
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Patch()
  @ResModel(Models.USER)
  async updateMfa(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateMfaStatusDTO,
  ) {
    return this.mfaService.updateMfaStatus(db, id, input.mfa)
  }

  @Get('factors')
  @ResModel(Models.MFA_FACTORS)
  async getMfaFactors(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.mfaService.getMfaFactors(db, id)
  }

  @Get('recovery-codes')
  @ResModel(Models.MFA_RECOVERY_CODES)
  async getMfaRecoveryCodes(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
  ) {
    return this.mfaService.getMfaRecoveryCodes(db, id)
  }

  @Patch('recovery-codes')
  @ResModel(Models.MFA_RECOVERY_CODES)
  async generateMfaRecoveryCodes(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
  ) {
    return this.mfaService.generateMfaRecoveryCodes(db, id)
  }

  @Put('recovery-codes')
  @ResModel(Models.MFA_RECOVERY_CODES)
  async regenerateMfaRecoveryCodes(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
  ) {
    return this.mfaService.regenerateMfaRecoveryCodes(db, id)
  }

  @Delete('authenticators/:type')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMfaAuthenticator(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('type') type: string,
  ) {
    return this.mfaService.deleteMfaAuthenticator(db, id, type)
  }
}
