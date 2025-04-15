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
import { SchemaService } from './schema.service';
import { ProjectGuard } from '@nuvix/core/resolvers/guards';
import {
  ResponseInterceptor,
  ApiInterceptor,
} from '@nuvix/core/resolvers/interceptors';
import {
  CurrentSchema,
  Label,
  Namespace,
  Project,
  ProjectPg,
  ResModel,
  Scope,
} from '@nuvix/core/decorators';
import { Document } from '@nuvix/database';
import { DataSource } from '@nuvix/pg';

// DTO's

// Note: The `schemaId` parameter is used in hooks and must be included in all relevant routes.
@Controller({ version: ['1'], path: 'schemas' })
@UseGuards(ProjectGuard)
@Namespace() // TODO: --->
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get(':schemaId/table/:tableId')
  @Scope('schema.read')
  @Label('res.type', 'JSON')
  @Label('res.status', 'OK')
  async getRows(
    @Param('schemaId') schema: string,
    @Param('tableId') table: string,
    @CurrentSchema() pg: DataSource,
    @Query() query: any,
  ) {
    // console.log('parsedQuery', parsedQuery);
    // return await this.schemaService.getRows(pg, schema, table);
    return query;
  }
}
