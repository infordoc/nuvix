import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
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
  ResModel,
  Scope,
  Sdk,
  Auth,
} from '@nuvix/core/decorators';
import { Models } from '@nuvix/core/helper';

import { Database, Query as Queries } from '@nuvix/db';
import { SubscribersQueryPipe } from '@nuvix/core/pipes/queries';
import type { CreateSubscriberDTO } from './DTO/subscriber.dto';

@Namespace('messaging')
@UseGuards(ProjectGuard)
@Auth([AuthType.ADMIN, AuthType.KEY])
@Controller({ path: 'messaging/topics/:topicId/subscribers', version: ['1'] })
@UseInterceptors(ApiInterceptor, ResponseInterceptor)
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  @Scope('subscribers.create')
  @AuditEvent('subscriber.create', 'subscriber/{res.$id}')
  @ResModel(Models.SUBSCRIBER)
  @Sdk({
    name: 'createSubscriber',
    code: HttpStatus.CREATED,
    description: 'Create a subscriber for a topic',
  })
  async createSubscriber(
    @Param('topicId') topicId: string,
    @ProjectDatabase() db: Database,
    @Body() input: CreateSubscriberDTO,
  ) {
    return this.subscribersService.createSubscriber({
      db,
      topicId,
      input,
    });
  }

  @Get()
  @Scope('subscribers.read')
  @ResModel(Models.SUBSCRIBER, { list: true })
  @Sdk({
    name: 'listSubscribers',
    code: HttpStatus.OK,
    description: 'List all subscribers for a topic',
  })
  async listSubscribers(
    @Param('topicId') topicId: string,
    @ProjectDatabase() db: Database,
    @Query('queries', SubscribersQueryPipe) queries?: Queries[],
    @Query('search') search?: string,
  ) {
    return this.subscribersService.listSubscribers({
      db,
      topicId,
      queries,
      search,
    });
  }

  @Get(':subscriberId')
  @Scope('subscribers.read')
  @ResModel(Models.SUBSCRIBER)
  @Sdk({
    name: 'getSubscriber',
    code: HttpStatus.OK,
    description: 'Get a subscriber for a topic',
  })
  async getSubscriber(
    @Param('topicId') topicId: string,
    @Param('subscriberId') subscriberId: string,
    @ProjectDatabase() db: Database,
  ) {
    return this.subscribersService.getSubscriber(db, topicId, subscriberId);
  }

  @Delete(':subscriberId')
  @Scope('subscribers.delete')
  @AuditEvent('subscriber.delete', 'subscriber/{params.subscriberId}')
  @ResModel(Models.NONE)
  @Sdk({
    name: 'deleteSubscriber',
    code: HttpStatus.NO_CONTENT,
    description: 'Delete a subscriber for a topic',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSubscriber(
    @Param('topicId') topicId: string,
    @Param('subscriberId') subscriberId: string,
    @ProjectDatabase() db: Database,
  ) {
    return this.subscribersService.deleteSubscriber(db, topicId, subscriberId);
  }
}
