import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor';
import { Auth, AuthType, Namespace, ResModel, Scope } from '@nuvix/core/decorators';

import { Models } from '@nuvix/core/helper/response.helper';
import { User } from '@nuvix/core/decorators/project-user.decorator';
import {
  CreateMembershipDTO,
  UpdateMembershipDTO,
  UpdateMembershipStatusDTO,
} from './DTO/membership.dto';
import { Database, Query as Queries } from '@nuvix-tech/db';
import { ProjectGuard } from '@nuvix/core/resolvers/guards/project.guard';
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor';
import {
  AuthDatabase,
  Project,
} from '@nuvix/core/decorators/project.decorator';
import { Locale } from '@nuvix/core/decorators/locale.decorator';
import { LocaleTranslator } from '@nuvix/core/helper/locale.helper';
import type { ProjectsDoc, UsersDoc } from '@nuvix/utils/types';
import { MembershipsQueryPipe } from '@nuvix/core/pipes/queries';

@Namespace('teams')
@UseGuards(ProjectGuard)
@Auth([AuthType.ADMIN, AuthType.KEY])
@Controller({ version: ['1'], path: 'teams/:id/memberships' })
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post()
  @ResModel({ type: Models.MEMBERSHIP })
  async addMember(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Body() input: CreateMembershipDTO,
    @Project() project: ProjectsDoc,
    @Locale() locale: LocaleTranslator,
    @User() user: UsersDoc,
  ) {
    return this.membershipsService.addMember(db, id, input, project, user, locale);
  }

  @Get()
  @ResModel({ type: Models.MEMBERSHIP, list: true })
  async getMembers(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Query('queries', MembershipsQueryPipe) queries: Queries[],
    @Query('search') search?: string,
  ) {
    return this.membershipsService.getMembers(db, id, queries, search);
  }

  @Get(':memberId')
  @ResModel({ type: Models.MEMBERSHIP })
  async getMember(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.membershipsService.getMember(db, id, memberId);
  }

  @Patch(':memberId')
  @ResModel({ type: Models.MEMBERSHIP })
  async updateMember(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() input: UpdateMembershipDTO,
  ) {
    return this.membershipsService.updateMember(db, id, memberId, input);
  }

  @Patch(':memberId/status')
  @ResModel({ type: Models.MEMBERSHIP })
  async updateMemberStatus(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() input: UpdateMembershipStatusDTO,
  ) {
    return this.membershipsService.updateMemberStatus(db, id, memberId, input);
  }

  @Delete(':memberId')
  @ResModel({ type: Models.NONE })
  async removeMember(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.membershipsService.deleteMember(db, id, memberId);
  }
}
