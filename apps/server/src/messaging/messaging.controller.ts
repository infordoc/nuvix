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
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ProjectGuard } from '@nuvix/core/resolvers/guards';
import {
  ApiInterceptor,
  ResponseInterceptor,
} from '@nuvix/core/resolvers/interceptors';
import {
  AuditEvent,
  ProjectDatabase,
  AuthType,
  Namespace,
  Project,
  ResModel,
  Scope,
  Sdk,
  Auth,
} from '@nuvix/core/decorators';
import { Models } from '@nuvix/core/helper';

import { Database, Query as Queries } from '@nuvix-tech/db';
import {
  CreateEmailMessageDTO,
  CreatePushMessageDTO,
  CreateSmsMessageDTO,
  UpdateEmailMessageDTO,
  UpdatePushMessageDTO,
  UpdateSmsMessageDTO,
} from './DTO/message.dto';
import type { ProjectsDoc } from '@nuvix/utils/types';
import { MessagesQueryPipe, TargetsQueryPipe } from '@nuvix/core/pipes/queries';

@Namespace('messaging')
@UseGuards(ProjectGuard)
@Auth([AuthType.ADMIN, AuthType.KEY])
@Controller({ path: 'messaging/messages', version: ['1'] })
@UseInterceptors(ApiInterceptor, ResponseInterceptor)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('email')
  @Scope('messages.create')
  @AuditEvent('message.create', 'message/{res.$id}')
  @ResModel(Models.MESSAGE)
  @Sdk({
    name: 'createEmail',
    code: HttpStatus.CREATED,
    description: 'Create email',
  })
  async createEmail(
    @ProjectDatabase() db: Database,
    @Body() input: CreateEmailMessageDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.messagingService.createEmailMessage({
      db,
      input,
      project,
    });
  }

  @Post('sms')
  @Scope('messages.create')
  @AuditEvent('message.create', 'message/{res.$id}')
  @ResModel(Models.MESSAGE)
  @Sdk({
    name: 'createSms',
    code: HttpStatus.CREATED,
    description: 'Create SMS',
  })
  async createSms(
    @ProjectDatabase() db: Database,
    @Body() input: CreateSmsMessageDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.messagingService.createSmsMessage({
      db,
      input,
      project,
    });
  }

  @Post('push')
  @Scope('messages.create')
  @AuditEvent('message.create', 'message/{res.$id}')
  @ResModel(Models.MESSAGE)
  @Sdk({
    name: 'createPush',
    code: HttpStatus.CREATED,
    description: 'Create push notification',
  })
  async createPush(
    @ProjectDatabase() db: Database,
    @Body() input: CreatePushMessageDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.messagingService.createPushMessage({
      db,
      input,
      project,
    });
  }

  @Get()
  @Scope('messages.read')
  @ResModel(Models.MESSAGE, { list: true })
  @Sdk({
    name: 'listMessages',
    code: HttpStatus.OK,
    description: 'List all messages',
  })
  async listMessages(
    @ProjectDatabase() db: Database,
    @Query('queries', MessagesQueryPipe) queries: Queries[],
    @Query('search') search?: string,
  ) {
    return this.messagingService.listMessages({
      db,
      queries,
      search,
    });
  }

  @Get(':messageId')
  @Scope('messages.read')
  @ResModel(Models.MESSAGE)
  @Sdk({
    name: 'getMessage',
    code: HttpStatus.OK,
    description: 'Get message',
  })
  async getMessage(
    @Param('messageId') messageId: string,
    @ProjectDatabase() db: Database,
  ) {
    return this.messagingService.getMessage(db, messageId);
  }

  @Get(':messageId/targets')
  @Scope('messages.read')
  @ResModel(Models.TARGET, { list: true })
  @Sdk({
    name: 'listTargets',
    code: HttpStatus.OK,
    description: 'List all targets for a message',
  })
  async listTargets(
    @Param('messageId') messageId: string,
    @ProjectDatabase() db: Database,
    @Query('queries', TargetsQueryPipe) queries: Queries[],
  ) {
    return this.messagingService.listTargets({
      db,
      messageId,
      queries,
    });
  }

  @Patch('email/:messageId')
  @Scope('messages.update')
  @AuditEvent('message.update', 'message/{res.$id}')
  @ResModel(Models.MESSAGE)
  @Sdk({
    name: 'updateEmail',
    code: HttpStatus.OK,
    description: 'Update email',
  })
  async updateEmail(
    @Param('messageId') messageId: string,
    @ProjectDatabase() db: Database,
    @Body() input: UpdateEmailMessageDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.messagingService.updateEmailMessage({
      db,
      messageId,
      input,
      project,
    });
  }

  @Patch('sms/:messageId')
  @Scope('messages.update')
  @AuditEvent('message.update', 'message/{res.$id}')
  @ResModel(Models.MESSAGE)
  @Sdk({
    name: 'updateSms',
    code: HttpStatus.OK,
    description: 'Update SMS',
  })
  async updateSms(
    @Param('messageId') messageId: string,
    @ProjectDatabase() db: Database,
    @Body() input: UpdateSmsMessageDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.messagingService.updateSmsMessage({
      db,
      messageId,
      input,
      project,
    });
  }

  @Patch('push/:messageId')
  @Scope('messages.update')
  @AuditEvent('message.update', 'message/{res.$id}')
  @ResModel(Models.MESSAGE)
  @Sdk({
    name: 'updatePush',
    code: HttpStatus.OK,
    description: 'Update push notification',
  })
  async updatePush(
    @Param('messageId') messageId: string,
    @ProjectDatabase() db: Database,
    @Body() input: UpdatePushMessageDTO,
    @Project() project: ProjectsDoc,
  ) {
    return this.messagingService.updatePushMessage({
      db,
      messageId,
      input,
      project,
    });
  }

  @Delete(':messageId')
  @Scope('messages.delete')
  @AuditEvent('message.delete', 'message/{params.messageId}')
  @ResModel(Models.NONE)
  @Sdk({
    name: 'deleteMessage',
    code: HttpStatus.NO_CONTENT,
    description: 'Delete message',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @Param('messageId') messageId: string,
    @ProjectDatabase() db: Database,
  ) {
    return this.messagingService.deleteMessage(db, messageId);
  }
}
