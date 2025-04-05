import {
  Body,
  Controller,
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

// DTO's
import { CreateDocumentSchema } from './DTO/create-schema.dto';
import { DataSource } from '@nuvix/pg';

@Controller({ version: ['1'], path: 'schema' })
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post('document')
  @Scope('schema.create')
  @Label('res.type', 'JSON')
  @Label('res.status', 'CREATED')
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
}
