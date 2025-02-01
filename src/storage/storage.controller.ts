import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { ProjectGuard } from 'src/core/resolver/guards/project.guard';
import {
  ResolverInterceptor,
  ResponseType,
} from 'src/core/resolver/response.resolver';
import { Response } from 'src/core/helper/response.helper';
import { Query as Queries } from '@nuvix/database';
import { CreateBucketDTO } from './DTO/bucket.dto';
import { ParseQueryPipe } from 'src/core/pipes/query.pipe';

@Controller({ version: ['1'], path: 'storage' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResolverInterceptor)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('buckets')
  @ResponseType({ type: Response.MODEL_BUCKET, list: true })
  async getBuckets(
    @Query('queries', ParseQueryPipe) queries: Queries[],
    @Query('search') search?: string,
  ) {
    return await this.storageService.getBuckets(queries, search);
  }

  @Post('buckets')
  @ResponseType(Response.MODEL_BUCKET)
  async createBucket(@Body() createBucketDto: CreateBucketDTO) {
    return await this.storageService.createBucket(createBucketDto);
  }

  @Get('buckets/:id')
  @ResponseType(Response.MODEL_BUCKET)
  async getBucket(@Param('id') id: string) {
    return await this.storageService.getBucket(id);
  }
}
