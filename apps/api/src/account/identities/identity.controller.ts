import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Database } from '@nuvix-tech/db';
import { Query as Queries } from '@nuvix-tech/db';

import { AuditEvent, Scope, Sdk, Throttle } from '@nuvix/core/decorators';
import { ResModel } from '@nuvix/core/decorators/res-model.decorator';
import { AuthDatabase } from '@nuvix/core/decorators/project.decorator';
import { User } from '@nuvix/core/decorators/project-user.decorator';
import { Models } from '@nuvix/core/helper/response.helper';
import { ProjectGuard } from '@nuvix/core/resolvers/guards';
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor';
import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor';
import { IdentityService } from './identity.service';
import { IdentityIdParamDTO } from './DTO/identity.dto';
import type { UsersDoc } from '@nuvix/utils/types';
import { IdentitiesQueryPipe } from '@nuvix/core/pipes/queries';

@Controller({ version: ['1'], path: 'account/identities' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get()
  @Scope('account')
  @ResModel(Models.IDENTITY, { list: true })
  @Sdk({
    name: 'getIdentities',
  })
  async getIdentities(
    @User() user: UsersDoc,
    @AuthDatabase() db: Database,
    @Query('queries', IdentitiesQueryPipe) queries?: Queries[],
  ) {
    return this.identityService.getIdentities({ user, db, queries });
  }

  @Delete(':identityId')
  @Scope('account')
  @AuditEvent('identity.delete', {
    resource: 'user/{user.$id}/identity/{params.identityId}',
    userId: '{user.$id}',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResModel(Models.NONE)
  @Sdk({
    name: 'deleteIdentity',
    code: HttpStatus.NO_CONTENT,
  })
  async deleteIdentity(
    @Param() { identityId }: IdentityIdParamDTO,
    @AuthDatabase() db: Database,
  ) {
    return this.identityService.deleteIdentity({
      identityId,
      db,
    });
  }
}
