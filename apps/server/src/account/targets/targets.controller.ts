import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Database } from '@nuvix/db';
import { AuditEvent, Scope, Sdk } from '@nuvix/core/decorators';
import { ResModel } from '@nuvix/core/decorators/res-model.decorator';
import { AuthDatabase } from '@nuvix/core/decorators/project.decorator';
import { User } from '@nuvix/core/decorators/project-user.decorator';
import { Models } from '@nuvix/core/helper/response.helper';
import { ProjectGuard } from '@nuvix/core/resolvers/guards';
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor';
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor';

import { TargetsService } from './targets.service';
import {
  CreatePushTargetDTO,
  TargetIdParamDTO,
  UpdatePushTargetDTO,
} from './DTO/target.dto';
import type { UsersDoc } from '@nuvix/utils/types';

@Controller({ version: ['1'], path: 'account/targets' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class TargetsController {
  constructor(private readonly targetService: TargetsService) {}

  @Post('push')
  @Scope('account')
  @AuditEvent('target.create', {
    resource: 'user/{user.$id}/target/{res.$id}',
    userId: '{user.$id}',
  })
  @ResModel(Models.TARGET)
  @Sdk({
    name: 'createPushTarget',
  })
  async createPushTarget(
    @Body() input: CreatePushTargetDTO,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
    @Req() request: NuvixRequest,
  ) {
    return this.targetService.createPushTarget({
      ...input,
      user,
      db,
      userAgent: request.headers['user-agent'] || 'UNKNOWN',
    });
  }

  @Put(':targetId/push')
  @Scope('account')
  @AuditEvent('target.update', {
    resource: 'user/{user.$id}/target/{params.targetId}',
    userId: '{user.$id}',
  })
  @ResModel(Models.TARGET)
  @Sdk({
    name: 'updatePushTarget',
  })
  async updatePushTarget(
    @Param() { targetId }: TargetIdParamDTO,
    @Body() input: UpdatePushTargetDTO,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
    @Req() request: NuvixRequest,
  ) {
    return this.targetService.updatePushTarget({
      targetId,
      ...input,
      user,
      db,
      request,
    });
  }

  @Delete(':targetId/push')
  @Scope('account')
  @AuditEvent('target.delete', {
    resource: 'user/{user.$id}/target/{params.targetId}',
    userId: '{user.$id}',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResModel(Models.NONE)
  @Sdk({
    name: 'deletePushTarget',
  })
  async deletePushTarget(
    @Param() { targetId }: TargetIdParamDTO,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
  ) {
    return this.targetService.deletePushTarget({
      targetId,
      user,
      db,
    });
  }
}
