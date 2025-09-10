import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Models } from '@nuvix/core/helper/response.helper';
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor';
import {
  Namespace,
  Project,
  ResModel,
  AuthDatabase,
  Locale,
  Auth,
  AuthType,
} from '@nuvix/core/decorators';

import type { Database } from '@nuvix-tech/db';
import { ProjectGuard } from '@nuvix/core/resolvers/guards/project.guard';
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor';
import type { ProjectsDoc } from '@nuvix/utils/types';
import type { LocaleTranslator } from '@nuvix/core/helper';

@Namespace('users')
@Controller({ version: ['1'], path: 'users/:id/sessions' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
@Auth([AuthType.ADMIN, AuthType.KEY])
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ResModel(Models.SESSION, { list: true })
  async getSessions(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Locale() localeTranslater: LocaleTranslator,
  ): Promise<any> {
    return this.sessionsService.getSessions(db, id, localeTranslater);
  }

  @Post()
  @ResModel(Models.SESSION)
  async createSession(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Req() req: NuvixRequest,
    @Project() project: ProjectsDoc,
    @Locale() localeTranslater: LocaleTranslator,
  ): Promise<any> {
    return this.sessionsService.createSession(
      db,
      id,
      req.headers['user-agent'] || 'UNKNOWN',
      req.ip,
      project,
      localeTranslater,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSessions(@AuthDatabase() db: Database, @Param('id') id: string) {
    return this.sessionsService.deleteSessions(db, id);
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(
    @AuthDatabase() db: Database,
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.deleteSession(db, id, sessionId);
  }
}
