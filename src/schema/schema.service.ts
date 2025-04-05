import { Injectable } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { CreateDocumentSchema } from './DTO/create-schema.dto';
import { DataSource } from '@nuvix/pg';
import { Exception } from 'src/core/extend/exception';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SchemaJobs,
  SchemaQueueOptions,
} from 'src/core/resolvers/queues/schema.queue';

@Injectable()
export class SchemaService {
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
}
