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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { TargetsService } from './targets.service'
import { CreateTargetDTO, UpdateTargetDTO } from './DTO/target.dto'
import { Models } from '@nuvix/core/helper/response.helper'
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor'
import {
  AuditEvent,
  Namespace,
  ResModel,
  Scope,
  AuthDatabase,
  Auth,
  AuthType,
} from '@nuvix/core/decorators'
import type { Database } from '@nuvix/db'
import { ProjectGuard } from '@nuvix/core/resolvers/guards/project.guard'
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor'

@Namespace('users')
@Controller({ version: ['1'], path: 'users/:id/targets' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
@Auth([AuthType.ADMIN, AuthType.KEY])
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @Post()
  @Scope('targets.create')
  @ResModel(Models.TARGET)
  @AuditEvent('target.create', 'target/{res.$id}')
  async addTarget(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() createTargetDTO: CreateTargetDTO,
  ): Promise<any> {
    return this.targetsService.createTarget(db, id, createTargetDTO)
  }

  @Get()
  @ResModel(Models.TARGET, { list: true })
  async getTargets(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
  ): Promise<any> {
    return this.targetsService.getTargets(db, id)
  }

  @Get(':targetId')
  @ResModel(Models.TARGET)
  async getTarget(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('targetId') targetId: string,
  ): Promise<any> {
    return this.targetsService.getTarget(db, id, targetId)
  }

  @Patch(':targetId')
  @ResModel(Models.TARGET)
  async updateTarget(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('targetId') targetId: string,
    @Body() input: UpdateTargetDTO,
  ): Promise<any> {
    return this.targetsService.updateTarget(db, id, targetId, input)
  }

  @Delete(':targetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTarget(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('targetId') targetId: string,
  ) {
    return this.targetsService.deleteTarget(db, id, targetId)
  }
}
