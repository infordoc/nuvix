import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  Put,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ProjectGuard } from 'src/core/resolver/guards/project.guard';
import {
  ResolverInterceptor,
  ResponseType,
} from 'src/core/resolver/response.resolver';
import { Response } from 'src/core/helper/response.helper';
import { CreateDatabaseDTO, UpdateDatabaseDTO } from './DTO/database.dto';
import type { Query as Queries } from '@nuvix/database';
import { ParseQueryPipe } from 'src/core/pipes/query.pipe';
import { CreateCollectionDTO, UpdateCollectionDTO } from './DTO/collection.dto';

@Controller({ version: ['1'], path: 'databases' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResolverInterceptor)
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post()
  @ResponseType(Response.MODEL_DATABASE)
  async create(@Body() createDatabaseDto: CreateDatabaseDTO) {
    return await this.databaseService.create(createDatabaseDto);
  }

  @Get()
  @ResponseType({ type: Response.MODEL_DATABASE, list: true })
  async findAll(
    @Query('queries', ParseQueryPipe) queries: Queries[],
    @Query('search') search?: string,
  ) {
    return await this.databaseService.findAll(queries, search);
  }

  @Get(':id')
  @ResponseType(Response.MODEL_DATABASE)
  async findOne(@Param('id') id: string) {
    return await this.databaseService.findOne(id);
  }

  @Patch(':id')
  @ResponseType(Response.MODEL_DATABASE)
  async update(
    @Param('id') id: string,
    @Body() updateDatabaseDto: UpdateDatabaseDTO,
  ) {
    return await this.databaseService.update(id, updateDatabaseDto);
  }

  @Delete(':id')
  @ResponseType(Response.MODEL_NONE)
  async remove(@Param('id') id: string) {
    return await this.databaseService.remove(id);
  }

  @Get(':id/logs')
  @ResponseType({ type: Response.MODEL_LOG, list: true })
  async findLogs(
    @Param('id') id: string,
    @Query('queries', ParseQueryPipe) queries: Queries[],
    @Query('search') search?: string,
  ) {
    return await this.databaseService.getLogs(id, queries, search);
  }

  @Get(':id/collections')
  @ResponseType({ type: Response.MODEL_COLLECTION, list: true })
  async findCollections(
    @Param('id') id: string,
    @Query('queries', ParseQueryPipe) queries: Queries[],
    @Query('search') search?: string,
  ) {
    return await this.databaseService.getCollections(id, queries, search);
  }

  @Post(':id/collections')
  @ResponseType(Response.MODEL_COLLECTION)
  async createCollection(
    @Param('id') id: string,
    @Body() createCollectionDto: CreateCollectionDTO,
  ) {
    return await this.databaseService.createCollection(id, createCollectionDto);
  }

  @Get(':id/collections/:collectionId')
  @ResponseType(Response.MODEL_COLLECTION)
  async findCollection(
    @Param('id') id: string,
    @Param('collectionId') collectionId: string,
  ) {
    return await this.databaseService.getCollection(id, collectionId);
  }

  @Get(':id/collections/:collectionId/logs')
  @ResponseType({ type: Response.MODEL_LOG, list: true })
  async findCollectionLogs(
    @Param('id') id: string,
    @Param('collectionId') collectionId: string,
    @Query('queries', ParseQueryPipe) queries: Queries[],
  ) {
    return await this.databaseService.getCollectionLogs(
      id,
      collectionId,
      queries,
    );
  }

  @Put(':id/collections/:collectionId')
  @ResponseType(Response.MODEL_COLLECTION)
  async updateCollection(
    @Param('id') id: string,
    @Param('collectionId') collectionId: string,
    @Body() updateCollectionDto: UpdateCollectionDTO,
  ) {
    return await this.databaseService.updateCollection(
      id,
      collectionId,
      updateCollectionDto,
    );
  }

  @Delete(':id/collections/:collectionId')
  @ResponseType(Response.MODEL_NONE)
  async removeCollection(
    @Param('id') id: string,
    @Param('collectionId') collectionId: string,
  ) {
    return await this.databaseService.removeCollection(id, collectionId);
  }
}
