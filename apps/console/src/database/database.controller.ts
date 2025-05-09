import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ProjectGuard } from '@nuvix/core/resolvers/guards';
import {
  ResponseInterceptor,
  ApiInterceptor,
} from '@nuvix/core/resolvers/interceptors';
import { Document } from '@nuvix/database';
import { DataSource } from '@nuvix/pg';
import { Models } from '@nuvix/core/helper';
import {
  Project,
  ProjectPg,
  CurrentSchema,
  Label,
  ResModel,
  Scope,
} from '@nuvix/core/decorators';

// DTO's
import { CreateDocumentSchema, CreateSchema } from './DTO/create-schema.dto';

@Controller('databases')
@UseGuards(ProjectGuard)
@UseInterceptors(ResponseInterceptor, ApiInterceptor)
// Note: The `schemaId` parameter is used in hooks and must be included in all relevant routes.
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) { }

  @Post('schemas/document')
  @Scope('schema.create')
  @Label('res.type', 'JSON')
  @Label('res.status', 'CREATED')
  @ResModel(Models.SCHEMA)
  async createDocTypeSchema(
    @ProjectPg() pg: DataSource,
    @Project() project: Document,
    @Body() body: CreateDocumentSchema,
  ) {
    const result = await this.databaseService.createDocumentSchema(
      pg,
      project,
      body,
    );
    return result;
  }

  @Get('schemas')
  @Scope('schema.read')
  @Label('res.type', 'JSON')
  @Label('res.status', 'OK')
  @ResModel(Models.SCHEMA, { list: true })
  async getSchemas(@ProjectPg() pg: DataSource) {
    const schemas = await this.databaseService.getSchemas(pg);
    return schemas;
  }

  @Post('schemas')
  @Scope('schema.create')
  @Label('res.type', 'JSON')
  @Label('res.status', 'CREATED')
  @ResModel(Models.SCHEMA)
  async createSchema(@ProjectPg() pg: DataSource, @Body() body: CreateSchema) {
    const result = await this.databaseService.createSchema(pg, body);
    return result;
  }

  @Get('schemas/:schemaId')
  @Scope('schema.read')
  @Label('res.type', 'JSON')
  @Label('res.status', 'OK')
  @ResModel(Models.SCHEMA)
  async getSchema(@ProjectPg() pg: DataSource, @Param('schemaId') id: string) {
    const result = await this.databaseService.getSchema(pg, id);
    return result;
  }

  @Get('schemas/:schemaId/tables')
  @Scope('schema.read')
  @Label('res.type', 'JSON')
  @Label('res.status', 'OK')
  async getSchemaTables(
    @Param('schemaId') schema: string,
    @CurrentSchema() pg: DataSource,
  ) {
    const result = await this.databaseService.getTables(pg, schema);
    return result;
  }
}
