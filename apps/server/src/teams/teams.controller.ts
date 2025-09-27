import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { TeamsService } from './teams.service'
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor'
import {
  Auth,
  AuthType,
  Namespace,
  ResModel,
  Scope,
} from '@nuvix/core/decorators'

import { Models } from '@nuvix/core/helper/response.helper'
import {
  CreateTeamDTO,
  UpdateTeamDTO,
  UpdateTeamPrefsDTO,
} from './DTO/team.dto'
import { User } from '@nuvix/core/decorators/project-user.decorator'
import { Database, Query as Queries } from '@nuvix/db'
import { ProjectGuard } from '@nuvix/core/resolvers/guards/project.guard'
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor'
import { AuthDatabase } from '@nuvix/core/decorators/project.decorator'
import { TeamsQueryPipe } from '@nuvix/core/pipes/queries'

@Namespace('teams')
@UseGuards(ProjectGuard)
@Auth([AuthType.ADMIN, AuthType.KEY])
@Controller({ version: ['1'], path: 'teams' })
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @Scope('teams.read')
  @ResModel(Models.TEAM, { list: true })
  async findAll(
    @AuthDatabase() db: Database,
    @Query('queries', TeamsQueryPipe) queries?: Queries[],
    @Query('search') search?: string,
  ) {
    return this.teamsService.findAll(db, queries, search)
  }

  @Post()
  @ResModel(Models.TEAM)
  async create(
    @AuthDatabase() db: Database,
    @User() user: any,
    @Body() input: CreateTeamDTO,
  ) {
    return this.teamsService.create(db, user, input)
  }

  @Get(':id')
  @ResModel(Models.TEAM)
  async findOne(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.teamsService.findOne(db, id)
  }

  @Put(':id')
  @ResModel(Models.TEAM)
  async update(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateTeamDTO,
  ) {
    return this.teamsService.update(db, id, input)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResModel(Models.NONE)
  async remove(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.teamsService.remove(db, id)
  }

  @Get(':id/prefs')
  async getPrefs(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.teamsService.getPrefs(db, id)
  }

  @Put(':id/prefs')
  async setPrefs(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: UpdateTeamPrefsDTO,
  ) {
    return this.teamsService.setPrefs(db, id, input)
  }

  @Get(':id/logs')
  @ResModel({ type: Models.LOG, list: true })
  async teamLogs(@AuthDatabase() db: Database, @Param('id') id: string) {
    return {
      total: 0,
      logs: [],
    }
  }
}
