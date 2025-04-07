import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { DataSource } from '@nuvix/pg';
import { Exception } from 'src/core/extend/exception';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SchemaJobs,
  SchemaQueueOptions,
} from 'src/core/resolvers/queues/schema.queue';
import { INTERNAL_SCHEMAS } from 'src/Utils/constants';

// DTO's
import { CreateDocumentSchema } from './DTO/create-schema.dto';

@Injectable()
export class SchemaService {
  private readonly logger = new Logger(SchemaService.name);

  constructor(
    @InjectQueue('schema')
    private readonly schemasQueue: Queue<SchemaQueueOptions, any, SchemaJobs>,
  ) {}

  public async createDocumentSchema(
    db: DataSource,
    project: Document,
    data: CreateDocumentSchema,
  ) {
    const isExists = await db.getSchema(data.name);

    if (isExists) {
      throw new Exception(
        Exception.DATABASE_ALREADY_EXISTS,
        'Schema already exists',
      );
    }

    const schema = await db.createSchema(
      data.name,
      'document',
      data.description,
    );

    await this.schemasQueue.add('init_doc', {
      project: project,
      schema: schema.name,
    });

    return schema;
  }

  /**
   * @description Get all schemas
   */
  public async getSchemas(pg: DataSource) {
    const schemas = await pg
      .table('schemas', { schema: 'metadata' })
      .select('name', 'description', 'type')
      .whereNotIn('name', INTERNAL_SCHEMAS);

    return {
      schemas: schemas,
      total: schemas.length,
    };
  }

  /**
   * Get a schema by name
   */
  public async getSchema(pg: DataSource, name: string) {
    const schema = await pg
      .table('schemas', { schema: 'metadata' })
      .select('name', 'description', 'type')
      .where('name', name)
      .first();

    if (!schema) {
      throw new Exception(Exception.DATABASE_NOT_FOUND, 'Schema not found');
    }

    return schema;
  }
}
