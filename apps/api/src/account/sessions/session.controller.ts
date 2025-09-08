import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Database } from '@nuvix-tech/db';
import {
  AuditEvent,
  Label,
  Scope,
  Sdk,
  Throttle,
} from '@nuvix/core/decorators';
import { Locale } from '@nuvix/core/decorators/locale.decorator';
import { ResModel } from '@nuvix/core/decorators/res-model.decorator';
import {
  AuthDatabase,
  Project,
} from '@nuvix/core/decorators/project.decorator';
import { User } from '@nuvix/core/decorators/project-user.decorator';
import { LocaleTranslator } from '@nuvix/core/helper/locale.helper';
import { Models } from '@nuvix/core/helper/response.helper';
import { Public } from '@nuvix/core/resolvers/guards/auth.guard';
import { ProjectGuard } from '@nuvix/core/resolvers/guards';
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor';
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor';

import { SessionService } from './session.service';
import {
  CreateEmailSessionDTO,
  CreateOAuth2SessionDTO,
  CreateSessionDTO,
  OAuth2CallbackDTO,
  ProviderParamDTO,
} from './DTO/session.dto';
import {
  CreateEmailTokenDTO,
  CreateMagicURLTokenDTO,
  CreateOAuth2TokenDTO,
  CreatePhoneTokenDTO,
} from './DTO/token.dto';
import type { ProjectsDoc, UsersDoc } from '@nuvix/utils/types';

@Controller({ version: ['1'], path: 'account' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('sessions')
  @Scope('account')
  @Label('res.status', 'OK')
  @Label('res.type', 'JSON')
  @ResModel(Models.SESSION, { list: true })
  async getSessions(
    @User() user: UsersDoc,
    @Locale() locale: LocaleTranslator,
  ) {
    return this.sessionService.getSessions(user, locale);
  }

  @Delete('sessions')
  @Scope('account')
  @Label('res.status', 'NO_CONTENT')
  @Label('res.type', 'JSON')
  @ResModel(Models.NONE)
  @Throttle(100)
  @AuditEvent('session.delete', 'user/{user.$id}')
  async deleteSessions(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
  ) {
    return this.sessionService.deleteSessions(
      db,
      user,
      locale,
      request,
      response,
    );
  }

  @Get('sessions/:id')
  @Scope('account')
  @Label('res.status', 'OK')
  @Label('res.type', 'JSON')
  @ResModel(Models.SESSION)
  async getSession(
    @User() user: UsersDoc,
    @Param('id') sessionId: string,
    @Locale() locale: LocaleTranslator,
  ) {
    return this.sessionService.getSession(user, sessionId, locale);
  }

  @Delete('sessions/:id')
  @Scope('account')
  @Label('res.status', 'NO_CONTENT')
  @Label('res.type', 'JSON')
  @ResModel(Models.NONE)
  @Throttle(100)
  @AuditEvent('session.delete', 'user/{user.$id}')
  async deleteSession(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Param('id') id: string,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
  ) {
    return this.sessionService.deleteSession(
      db,
      user,
      id,
      request,
      response,
      locale,
    );
  }

  @Patch('sessions/:id')
  @Scope('account')
  @Label('res.status', 'OK')
  @Label('res.type', 'JSON')
  @ResModel(Models.SESSION)
  @Throttle(10)
  @AuditEvent('session.update', 'user/{res.userId}')
  async updateSession(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Param('id') id: string,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.updateSession(db, user, id, project);
  }

  @Public()
  @Post(['sessions/email', 'sessions'])
  @Scope('sessions.create')
  @Label('res.status', 'CREATED')
  @Label('res.type', 'JSON')
  @ResModel(Models.SESSION)
  @Throttle({
    limit: 10,
    key: 'email:{param-email}',
  })
  @AuditEvent('session.create', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  async createEmailSession(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() input: CreateEmailSessionDTO,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createEmailSession(
      db,
      user,
      input,
      request,
      response,
      locale,
      project,
    );
  }

  @Public()
  @Post('sessions/anonymous')
  @Scope('sessions.create')
  @ResModel(Models.SESSION)
  @Throttle({
    limit: 50,
    key: 'ip:{ip}',
  })
  @AuditEvent('session.create', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  @Sdk({
    name: 'createAnonymousSession',
  })
  async createAnonymousSession(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createAnonymousSession({
      user,
      request,
      response,
      locale,
      project,
      db: db,
    });
  }

  @Public()
  @Post('sessions/token')
  @Scope('sessions.update')
  @ResModel(Models.SESSION)
  @Throttle({
    limit: 10,
    key: 'ip:{ip},userId:{param-userId}',
  })
  @AuditEvent('session.update', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  @Sdk({
    name: 'createSession',
  })
  async createSession(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() input: CreateSessionDTO,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createSession({
      user,
      input,
      request,
      response,
      locale,
      project,
      db,
    });
  }

  @Public()
  @Get('sessions/oauth2/:provider')
  @Scope('sessions.create')
  @Throttle({
    limit: 50,
    key: 'ip:{ip}',
  })
  @Sdk({
    name: 'createOAuth2Session',
  })
  async createOAuth2Session(
    @Query() input: CreateOAuth2SessionDTO,
    @Req() request: NuvixRequest,
    @Res() response: NuvixRes,
    @Param() { provider }: ProviderParamDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createOAuth2Session({
      input,
      request,
      response,
      provider,
      project,
    });
  }

  @Public()
  @Get('sessions/oauth2/callback/:provider/:projectId')
  @Scope('public')
  async OAuth2Callback(
    @Query() input: OAuth2CallbackDTO,
    @Req() request: NuvixRequest,
    @Res() response: NuvixRes,
    @Param('projectId') projectId: string,
    @Param() { provider }: ProviderParamDTO,
  ) {
    const domain = request.host;
    const protocol = request.protocol;

    const params: Record<string, any> = { ...input };
    params['provider'] = provider;
    params['project'] = projectId;

    response
      .status(302)
      .header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      .header('Pragma', 'no-cache')
      .redirect(
        `${protocol}://${domain}/v1/account/sessions/oauth2/${provider}/redirect?${new URLSearchParams(params).toString()}`,
      );
  }

  @Public()
  @Post('sessions/oauth2/callback/:provider/:projectId')
  @Scope('public')
  async OAuth2CallbackWithProject(
    @Body() input: OAuth2CallbackDTO,
    @Req() request: NuvixRequest,
    @Res() response: NuvixRes,
    @Param('projectId') projectId: string,
    @Param() { provider }: ProviderParamDTO,
  ) {
    const domain = request.host;
    const protocol = request.protocol;

    const params: Record<string, any> = { ...input };
    params['provider'] = provider;
    params['project'] = projectId;

    response
      .status(302)
      .header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      .header('Pragma', 'no-cache')
      .redirect(
        `${protocol}://${domain}/v1/account/sessions/oauth2/${provider}/redirect?${new URLSearchParams(params).toString()}`,
      );
  }

  @Public()
  @Get('sessions/oauth2/:provider/redirect')
  @Scope('public')
  @Throttle({
    limit: 50,
    key: 'ip:{ip}',
  })
  @AuditEvent('session.create', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  async OAuth2Redirect(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Query() input: OAuth2CallbackDTO,
    @Req() request: NuvixRequest,
    @Res() response: NuvixRes,
    @Project() project: ProjectsDoc,
    @Param() { provider }: ProviderParamDTO,
  ) {
    return this.sessionService.oAuth2Redirect({
      db: db,
      user,
      input,
      provider,
      request,
      response,
      project,
    });
  }

  @Public()
  @Get('tokens/oauth2/:provider')
  @Scope('sessions.create')
  @Throttle({
    limit: 50,
    key: 'ip:{ip}',
  })
  @Sdk({
    name: 'createOAuth2Token',
  })
  async createOAuth2Token(
    @Query() input: CreateOAuth2TokenDTO,
    @Req() request: NuvixRequest,
    @Res() response: NuvixRes,
    @Param() { provider }: ProviderParamDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createOAuth2Token({
      input,
      request,
      response,
      provider,
      project,
    });
  }

  @Public()
  @Post('tokens/magic-url')
  @ResModel(Models.TOKEN)
  @Throttle({
    limit: 60,
    key: ({ body, ip }) => [`email:${body['email']}`, `ip:${ip}`],
  })
  @AuditEvent('session.create', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  @Sdk({
    name: 'createMagicURLToken',
  })
  async createMagicURLToken(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() input: CreateMagicURLTokenDTO,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createMagicURLToken({
      db: db,
      user,
      input,
      request,
      response,
      locale,
      project,
    });
  }

  @Public()
  @Post('tokens/email')
  @Scope('sessions.create')
  @ResModel(Models.TOKEN)
  @Throttle({
    limit: 10,
    key: ({ body, ip }) => [`email:${body['email']}`, `ip:${ip}`],
  })
  @AuditEvent('session.create', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  @Sdk({
    name: 'createEmailToken',
  })
  async createEmailToken(
    @Body() input: CreateEmailTokenDTO,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Project() project: ProjectsDoc,
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
    @Locale() locale: LocaleTranslator,
  ) {
    return this.sessionService.createEmailToken({
      input,
      request,
      response,
      project,
      user,
      db: db,
      locale,
    });
  }

  @Public()
  @Put('sessions/magic-url')
  @ResModel(Models.SESSION)
  @Throttle({
    limit: 10,
    key: 'ip:{ip},userId:{param-userId}',
  })
  @AuditEvent('session.create', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  @Sdk({
    name: 'updateMagicURLSession',
  })
  async updateMagicURLSession(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() input: CreateSessionDTO,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createSession({
      user,
      input,
      request,
      response,
      locale,
      project,
      db,
    });
  }

  @Public()
  @Put('sessions/phone')
  @Throttle({
    limit: 10,
    key: 'ip:{ip},userId:{param-userId}',
  })
  @Scope('sessions.update')
  @ResModel(Models.SESSION)
  @AuditEvent('session.create', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  @Sdk({
    name: 'updatePhoneSession',
  })
  async updatePhoneSession(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() input: CreateSessionDTO,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createSession({
      user,
      input,
      request,
      response,
      locale,
      project,
      db,
    });
  }

  @Public()
  @Post(['tokens/phone', 'sessions/phone'])
  @Scope('sessions.create')
  @Throttle({
    limit: 10,
    key: ({ body, ip }) => [`phone:${body['phone']}`, `ip:${ip}`],
  })
  @ResModel(Models.TOKEN)
  @AuditEvent('session.create', {
    resource: 'user/{res.userId}',
    userId: '{res.userId}',
  })
  @Sdk({
    name: 'createPhoneToken',
  })
  async createPhoneToken(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() input: CreatePhoneTokenDTO,
    @Req() request: NuvixRequest,
    @Res({ passthrough: true }) response: NuvixRes,
    @Locale() locale: LocaleTranslator,
    @Project() project: ProjectsDoc,
  ) {
    return this.sessionService.createPhoneToken({
      db: db,
      user,
      input,
      request,
      response,
      locale,
      project,
    });
  }
}
