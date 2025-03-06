import { Database, Document } from '@nuvix/database';
import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { UsageJobs, UsageQueueOptions } from '../resolvers/queues';
import {
  METRIC_BUCKET_ID_FILES,
  METRIC_BUCKET_ID_FILES_STORAGE,
  METRIC_BUCKETS,
  METRIC_COLLECTIONS,
  METRIC_DATABASE_ID_COLLECTION_ID_DOCUMENTS,
  METRIC_DATABASE_ID_COLLECTIONS,
  METRIC_DATABASE_ID_DOCUMENTS,
  METRIC_DATABASES,
  METRIC_DEPLOYMENTS,
  METRIC_DEPLOYMENTS_STORAGE,
  METRIC_DOCUMENTS,
  METRIC_FILES,
  METRIC_FILES_STORAGE,
  METRIC_FUNCTION_ID_DEPLOYMENTS,
  METRIC_FUNCTION_ID_DEPLOYMENTS_STORAGE,
  METRIC_FUNCTIONS,
  METRIC_SESSIONS,
  METRIC_TEAMS,
  METRIC_USERS,
} from 'src/Utils/constants';
import { Logger } from '@nestjs/common';

export class MetricsHelper {
  private redis: Redis;
  private readonly logger = new Logger(MetricsHelper.name);

  constructor(connection: Redis) {
    this.redis = connection;
  }

  addMetric(metric: string, value: number): MetricsHelper {
    this.logger.log(`Adding metric ${metric} with value ${value}`);
    this.redis.hincrby('usage', metric, value);
    return this;
  }

  addReduce(document: Document): MetricsHelper {
    this.redis.hincrby('usage', 'reduced', 1);
    return this;
  }

  async saveMetrics(): Promise<void> {
    const metrics = await this.redis.hgetall('usage');
    await this.redis.del('usage');
    await this.redis.hset('usage', 'reduced', 0);

    for (const [metric, value] of Object.entries(metrics)) {
      await this.redis.hincrby('usage', metric, parseInt(value, 10));
    }
  }
}

interface DbListionerProps {
  event: string;
  document: Document;
  project: Document;
  queueForUsage: MetricsHelper;
  dbForProject: Database;
}

export async function databaseListener({
  event,
  document,
  project,
  queueForUsage,
  dbForProject,
}: DbListionerProps) {
  let value = 1;
  if (event === Database.EVENT_DOCUMENT_DELETE) {
    value = -1;
  }

  switch (true) {
    case document.getCollection() === 'teams':
      queueForUsage.addMetric(METRIC_TEAMS, value); // per project
      break;
    case document.getCollection() === 'users':
      queueForUsage.addMetric(METRIC_USERS, value); // per project
      if (event === Database.EVENT_DOCUMENT_DELETE) {
        queueForUsage.addReduce(document);
      }
      break;
    case document.getCollection() === 'sessions': // sessions
      queueForUsage.addMetric(METRIC_SESSIONS, value); // per project
      break;
    case document.getCollection() === 'databases': // databases
      queueForUsage.addMetric(METRIC_DATABASES, value); // per project
      if (event === Database.EVENT_DOCUMENT_DELETE) {
        queueForUsage.addReduce(document);
      }
      break;
    case document.getCollection().startsWith('database_') &&
      !document.getCollection().includes('collection'): // collections
      const parts = document.getCollection().split('_');
      const databaseInternalId = parts[1] ?? 0;
      queueForUsage
        .addMetric(METRIC_COLLECTIONS, value) // per project
        .addMetric(
          METRIC_DATABASE_ID_COLLECTIONS.replace(
            '{databaseInternalId}',
            databaseInternalId.toString(),
          ),
          value,
        ); // per database
      if (event === Database.EVENT_DOCUMENT_DELETE) {
        queueForUsage.addReduce(document);
      }
      break;
    case document.getCollection().startsWith('database_') &&
      document.getCollection().includes('_collection_'): // documents
      const docParts = document.getCollection().split('_');
      const dbInternalId = docParts[1] ?? 0;
      const collectionInternalId = docParts[3] ?? 0;
      queueForUsage
        .addMetric(METRIC_DOCUMENTS, value) // per project
        .addMetric(
          METRIC_DATABASE_ID_DOCUMENTS.replace(
            '{databaseInternalId}',
            dbInternalId.toString(),
          ),
          value,
        ) // per database
        .addMetric(
          METRIC_DATABASE_ID_COLLECTION_ID_DOCUMENTS.replace(
            '{databaseInternalId}',
            dbInternalId.toString(),
          ).replace('{collectionInternalId}', collectionInternalId.toString()),
          value,
        ); // per collection
      break;
    case document.getCollection() === 'buckets': // buckets
      queueForUsage.addMetric(METRIC_BUCKETS, value); // per project
      if (event === Database.EVENT_DOCUMENT_DELETE) {
        queueForUsage.addReduce(document);
      }
      break;
    case document.getCollection().startsWith('bucket_'): // files
      const bucketParts = document.getCollection().split('_');
      const bucketInternalId = bucketParts[1];
      queueForUsage
        .addMetric(METRIC_FILES, value) // per project
        .addMetric(
          METRIC_FILES_STORAGE,
          document.getAttribute('sizeOriginal') * value,
        ) // per project
        .addMetric(
          METRIC_BUCKET_ID_FILES.replace(
            '{bucketInternalId}',
            bucketInternalId,
          ),
          value,
        ) // per bucket
        .addMetric(
          METRIC_BUCKET_ID_FILES_STORAGE.replace(
            '{bucketInternalId}',
            bucketInternalId,
          ),
          document.getAttribute('sizeOriginal') * value,
        ); // per bucket
      break;
    case document.getCollection() === 'functions':
      queueForUsage.addMetric(METRIC_FUNCTIONS, value); // per project
      if (event === Database.EVENT_DOCUMENT_DELETE) {
        queueForUsage.addReduce(document);
      }
      break;
    case document.getCollection() === 'deployments':
      queueForUsage
        .addMetric(METRIC_DEPLOYMENTS, value) // per project
        .addMetric(
          METRIC_DEPLOYMENTS_STORAGE,
          document.getAttribute('size') * value,
        ) // per project
        .addMetric(
          METRIC_FUNCTION_ID_DEPLOYMENTS.replace(
            '{resourceType}',
            document.getAttribute('resourceType'),
          ).replace(
            '{resourceInternalId}',
            document.getAttribute('resourceInternalId'),
          ),
          value,
        ) // per function
        .addMetric(
          METRIC_FUNCTION_ID_DEPLOYMENTS_STORAGE.replace(
            '{resourceType}',
            document.getAttribute('resourceType'),
          ).replace(
            '{resourceInternalId}',
            document.getAttribute('resourceInternalId'),
          ),
          document.getAttribute('size') * value,
        );
      break;
    default:
      break;
  }
}
