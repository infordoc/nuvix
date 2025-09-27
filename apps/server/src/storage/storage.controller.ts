import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor'
import { StorageService } from './storage.service'
import { Models } from '@nuvix/core/helper/response.helper'
import { Database, Query as Queries } from '@nuvix/db'
import { ProjectGuard } from '@nuvix/core/resolvers/guards/project.guard'
import {
  ResModel,
  ProjectDatabase,
  Namespace,
  Auth,
  AuthType,
} from '@nuvix/core/decorators'

import { CreateBucketDTO, UpdateBucketDTO } from './DTO/bucket.dto'
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor'
import { BucketsQueryPipe } from '@nuvix/core/pipes/queries'

@Namespace('storage')
@UseGuards(ProjectGuard)
@Auth([AuthType.ADMIN, AuthType.KEY])
@Controller({ version: ['1'], path: 'storage' })
@UseInterceptors(ApiInterceptor, ResponseInterceptor)
export class StorageController {
  private readonly logger = new Logger(StorageController.name)
  constructor(private readonly storageService: StorageService) {}

  @Get('buckets')
  @ResModel({ type: Models.BUCKET, list: true })
  async getBuckets(
    @ProjectDatabase() db: Database,
    @Query('queries', BucketsQueryPipe) queries?: Queries[],
    @Query('search') search?: string,
  ) {
    return this.storageService.getBuckets(db, queries, search)
  }

  @Post('buckets')
  @ResModel(Models.BUCKET)
  async createBucket(
    @ProjectDatabase() db: Database,
    @Body() createBucketDTO: CreateBucketDTO,
  ) {
    return this.storageService.createBucket(db, createBucketDTO)
  }

  @Get('buckets/:id')
  @ResModel(Models.BUCKET)
  async getBucket(@ProjectDatabase() db: Database, @Param('id') id: string) {
    return this.storageService.getBucket(db, id)
  }

  @Put('buckets/:id')
  @ResModel(Models.BUCKET)
  async updateBucket(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Body() createBucketDTO: UpdateBucketDTO,
  ) {
    return this.storageService.updateBucket(db, id, createBucketDTO)
  }

  @Delete('buckets/:id')
  @ResModel(Models.NONE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBucket(@ProjectDatabase() db: Database, @Param('id') id: string) {
    return this.storageService.deleteBucket(db, id)
  }

  @Get('usage')
  @ResModel(Models.USAGE_STORAGE)
  async getUsage(
    @ProjectDatabase() db: Database,
    @Query('range') range?: string,
  ) {
    return this.storageService.getStorageUsage(db, range)
  }

  @Get(':id/usage')
  @ResModel(Models.USAGE_BUCKETS)
  async getBucketUsage(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Query('range') range?: string,
  ) {
    return this.storageService.getBucketStorageUsage(db, id, range)
  }
}
