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
import { TopicsService } from './topics.service';
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

import { Database, Query as Queries } from '@nuvix-tech/db';
import { CreateTopicDTO, UpdateTopicDTO } from './DTO/topics.dto';
import { TopicsQueryPipe } from '@nuvix/core/pipes/queries';

@Namespace('messaging')
@UseGuards(ProjectGuard)
@Auth([AuthType.ADMIN, AuthType.KEY])
@Controller({ path: 'messaging/topics', version: ['1'] })
@UseInterceptors(ApiInterceptor, ResponseInterceptor)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @Scope('topics.create')
  @AuditEvent('topic.create', 'topic/{res.$id}')
  @ResModel(Models.TOPIC)
  @Sdk({
    name: 'createTopic',
    code: HttpStatus.CREATED,
    description: 'Create a topic',
  })
  async createTopic(
    @ProjectDatabase() db: Database,
    @Body() input: CreateTopicDTO,
  ) {
    return this.topicsService.createTopic({
      db,
      input,
    });
  }

  @Get()
  @Scope('topics.read')
  @ResModel(Models.TOPIC, { list: true })
  @Sdk({
    name: 'listTopics',
    code: HttpStatus.OK,
    description: 'List all topics',
  })
  async listTopics(
    @ProjectDatabase() db: Database,
    @Query('queries', TopicsQueryPipe) queries: Queries[],
    @Query('search') search?: string,
  ) {
    return this.topicsService.listTopics({
      db,
      queries,
      search,
    });
  }

  @Get(':topicId')
  @Scope('topics.read')
  @ResModel(Models.TOPIC)
  @Sdk({
    name: 'getTopic',
    code: HttpStatus.OK,
    description: 'Get topic',
  })
  async getTopic(
    @Param('topicId') topicId: string,
    @ProjectDatabase() db: Database,
  ) {
    return this.topicsService.getTopic(db, topicId);
  }

  @Patch(':topicId')
  @Scope('topics.update')
  @AuditEvent('topic.update', 'topic/{res.$id}')
  @ResModel(Models.TOPIC)
  @Sdk({
    name: 'updateTopic',
    code: HttpStatus.OK,
    description: 'Update topic',
  })
  async updateTopic(
    @Param('topicId') topicId: string,
    @ProjectDatabase() db: Database,
    @Body() input: UpdateTopicDTO,
  ) {
    return this.topicsService.updateTopic({
      db,
      topicId,
      input,
    });
  }

  @Delete(':topicId')
  @Scope('topics.delete')
  @AuditEvent('topic.delete', 'topic/{params.topicId}')
  @ResModel(Models.NONE)
  @Sdk({
    name: 'deleteTopic',
    code: HttpStatus.NO_CONTENT,
    description: 'Delete topic',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTopic(
    @Param('topicId') topicId: string,
    @ProjectDatabase() db: Database,
  ) {
    return this.topicsService.deleteTopic(db, topicId);
  }
}
