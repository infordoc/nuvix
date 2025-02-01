import { Inject, Injectable } from '@nestjs/common';
import {
  Database,
  Document,
  DuplicateException,
  ID,
  Permission,
  Query,
} from '@nuvix/database';
import { Exception } from 'src/core/extend/exception';
import {
  APP_LIMIT_COUNT,
  DB_FOR_CONSOLE,
  DB_FOR_PROJECT,
} from 'src/Utils/constants';
import { CreateBucketDTO } from './DTO/bucket.dto';
import collections from 'src/core/collections';

@Injectable()
export class StorageService {
  constructor(
    @Inject(DB_FOR_CONSOLE) private readonly dbForConsole: Database,
    @Inject(DB_FOR_PROJECT) private readonly db: Database,
  ) {}

  /**
   * Get buckets.
   */
  async getBuckets(queries: any, search?: string) {
    if (search) {
      queries.push(Query.search('search', search));
    }

    const cursor = queries.find((query: Query) =>
      [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(
        query.getMethod(),
      ),
    );

    if (cursor) {
      const bucketId = cursor.getValue();
      const cursorDocument = await this.db.getDocument('buckets', bucketId);

      if (cursorDocument.isEmpty()) {
        throw new Exception(
          Exception.GENERAL_CURSOR_NOT_FOUND,
          `Bucket '${bucketId}' for the 'cursor' value not found.`,
        );
      }

      cursor.setValue(cursorDocument);
    }

    const filterQueries = Query.groupByType(queries).filters;

    return {
      buckets: await this.db.find('buckets', queries),
      total: await this.db.count('buckets', filterQueries, APP_LIMIT_COUNT),
    };
  }

  /**
   * Create bucket.
   */
  async createBucket(input: CreateBucketDTO) {
    const bucketId =
      input.bucketId === 'unique()' ? ID.unique() : input.bucketId;

    // Map aggregate permissions into the multiple permissions they represent.
    const permissions = Permission.aggregate(input.permissions);

    try {
      const files = (collections['buckets'] ?? {})['files'] ?? {};
      if (!files) {
        throw new Exception(
          Exception.GENERAL_SERVER_ERROR,
          'Files collection is not configured.',
        );
      }

      const attributes = files['attributes'].map(
        (attribute: any) =>
          new Document({
            $id: attribute.$id,
            type: attribute.type,
            size: attribute.size,
            required: attribute.required,
            signed: attribute.signed,
            array: attribute.array,
            filters: attribute.filters,
            default: attribute.default ?? null,
            format: attribute.format ?? '',
          }),
      );

      const indexes = files['indexes'].map(
        (index: any) =>
          new Document({
            $id: index.$id,
            type: index.type,
            attributes: index.attributes,
            lengths: index.lengths,
            orders: index.orders,
          }),
      );

      await this.db.createDocument(
        'buckets',
        new Document({
          $id: bucketId,
          $collection: 'buckets',
          $permissions: permissions,
          name: input.name,
          maximumFileSize: input.maximumFileSize,
          allowedFileExtensions: input.allowedFileExtensions,
          fileSecurity: input.fileSecurity,
          enabled: input.enabled,
          compression: input.compression,
          encryption: input.encryption,
          antivirus: input.antivirus,
          search: [bucketId, input.name].join(' '),
        }),
      );

      const bucket = await this.db.getDocument('buckets', bucketId);

      await this.db.createCollection({
        id: 'bucket_' + bucket.getInternalId(),
        attributes,
        indexes,
        permissions: permissions ?? [],
        documentSecurity: input.fileSecurity,
      });

      return bucket;
    } catch (error) {
      if (error instanceof DuplicateException) {
        throw new Exception(Exception.STORAGE_BUCKET_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  /**
   * Get a bucket.
   */
  async getBucket(id: string) {
    const bucket = await this.db.getDocument('buckets', id);

    if (bucket.isEmpty())
      throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);

    return bucket;
  }
}
