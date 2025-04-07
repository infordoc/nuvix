import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SchemaService } from './schema.service';
import { ProjectGuard } from 'src/core/resolvers/guards';
import {
  ResponseInterceptor,
  ApiInterceptor,
} from 'src/core/resolvers/interceptors';
import {
  CurrentSchema,
  Label,
  Project,
  ProjectPg,
  ResModel,
  Scope,
} from 'src/core/decorators';
import { Document } from '@nuvix/database';
import { DataSource } from '@nuvix/pg';
import { Models } from 'src/core/helper';

// DTO's
import { CreateDocumentSchema } from './DTO/create-schema.dto';

@Controller({ version: ['1'], path: 'schema' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post('document')
  @Scope('schema.create')
  @Label('res.type', 'JSON')
  @Label('res.status', 'CREATED')
  @ResModel(Models.SCHEMA)
  async createDocTypeSchema(
    @ProjectPg() pg: DataSource,
    @Project() project: Document,
    @Body() body: CreateDocumentSchema,
  ) {
    const result = await this.schemaService.createDocumentSchema(
      pg,
      project,
      body,
    );
    return result;
  }

  @Get()
  @Scope('schema.read')
  @Label('res.type', 'JSON')
  @Label('res.status', 'OK')
  @ResModel(Models.SCHEMA, { list: true })
  async getSchemas(@ProjectPg() pg: DataSource) {
    const schemas = await this.schemaService.getSchemas(pg);
    return schemas;
  }

  @Get(':schemaId')
  @Scope('schema.read')
  @Label('res.type', 'JSON')
  @Label('res.status', 'OK')
  @ResModel(Models.SCHEMA)
  async getSchema(@ProjectPg() pg: DataSource, @Param('schemaId') id: string) {
    const result = await this.schemaService.getSchema(pg, id);
    return result;
  }
}
