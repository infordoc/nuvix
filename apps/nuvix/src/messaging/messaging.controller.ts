import { Body, Controller, Get, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ProjectGuard } from '@nuvix/core/resolvers/guards';
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors';
import { AuditEvent, AuthType, MessagingDatabase, Project, ResModel, Scope, Sdk } from '@nuvix/core/decorators';
import { Models } from '@nuvix/core/helper';
import { User } from '@nuvix/core/decorators/project-user.decorator';

import { CreateMailgunProviderDTO } from './DTO/mailgun.dto';
import { Database } from '@nuvix/database';


@Controller({ path: 'messaging', version: ['1'] })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) { }

  @Post('providers/mailgun')
  @Scope('providers.create')
  @AuditEvent('provider.create', 'provider/{res.$id}')
  @ResModel(Models.PROVIDER)
  @Sdk({
    name: 'createMailgunProvider',
    auth: [AuthType.ADMIN, AuthType.KEY],
    code: HttpStatus.CREATED,
    description: 'Create a Mailgun provider',
  })
  async createMailgunProvider(
    @MessagingDatabase() db: Database,
    @Body() input: CreateMailgunProviderDTO,
  ) {
    return await this.messagingService.createMailgunProvider({
      db,
      input,
    });
  }



}
