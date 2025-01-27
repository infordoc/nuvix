import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Authorization,
  Database,
  Document,
  DuplicateException,
  ID,
  LimitException,
  Permission,
  Query,
} from '@nuvix/database';
import { APP_LIMIT_COUNT, DB_FOR_PROJECT, GEO_DB } from 'src/Utils/constants';
import { CreateDatabaseDTO, UpdateDatabaseDTO } from './DTO/database.dto';
import collections from 'src/core/collections';
import { Exception } from 'src/core/extend/exception';
import { Detector } from 'src/core/helper/detector.helper';
import { CountryResponse, Reader } from 'maxmind';
import { CreateCollectionDTO, UpdateCollectionDTO } from './DTO/collection.dto';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject(DB_FOR_PROJECT) private readonly db: Database,
    @Inject(GEO_DB) private readonly geoDb: Reader<CountryResponse>,
  ) {}

  /**
   * Create a new database.
   */
  async create(createDatabaseDto: CreateDatabaseDTO) {
    const { databaseId: id, name, enabled } = createDatabaseDto;
    const databaseId = id === 'unique()' ? ID.unique() : id;

    try {
      await this.db.createDocument(
        'databases',
        new Document({
          $id: databaseId,
          name,
          enabled: enabled ?? true,
          search: `${databaseId} ${name}`,
        }),
      );

      const database = await this.db.getDocument('databases', databaseId);

      const _collections = ((collections['databases'] ?? {})['collections'] ??
        []) as any[];
      if (_collections.length === 0) {
        throw new Exception(
          Exception.GENERAL_SERVER_ERROR,
          'The "collections" collection is not configured.',
        );
      }

      const attributes = _collections['attributes'].map(
        (attribute: any) =>
          new Document({
            $id: attribute['$id'],
            type: attribute['type'],
            size: attribute['size'],
            required: attribute['required'],
            signed: attribute['signed'],
            array: attribute['array'],
            filters: attribute['filters'],
            default: attribute['default'] ?? null,
            format: attribute['format'] ?? '',
          }),
      );

      const indexes = _collections['indexes'].map(
        (index: any) =>
          new Document({
            $id: index['$id'],
            type: index['type'],
            attributes: index['attributes'],
            lengths: index['lengths'],
            orders: index['orders'],
          }),
      );

      await this.db.createCollection(
        `database_${database.getInternalId()}`,
        attributes,
        indexes,
      );

      return database;
    } catch (error) {
      if (error instanceof DuplicateException) {
        throw new Exception(Exception.DATABASE_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  /**
   * Find all databases.
   */
  async findAll(queries: Query[], search?: string) {
    if (search) {
      queries.push(Query.search('search', search));
    }

    const cursor = queries.find((query) =>
      [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(
        query.getMethod(),
      ),
    );

    if (cursor) {
      const databaseId = cursor.getValue();
      const cursorDocument = await this.db.getDocument('databases', databaseId);

      if (!cursorDocument) {
        throw new Exception(
          Exception.GENERAL_CURSOR_NOT_FOUND,
          `Database '${databaseId}' for the 'cursor' value not found.`,
        );
      }

      cursor.setValue(cursorDocument);
    }

    const filterQueries = Query.groupByType(queries).filters;

    const databases = await this.db.find('databases', queries);
    const total = await this.db.count(
      'databases',
      filterQueries,
      APP_LIMIT_COUNT,
    );

    return {
      databases,
      total,
    };
  }

  /**
   * Find one database.
   */
  async findOne(id: string) {
    const database = await this.db.getDocument('databases', id);

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    return database;
  }

  async update(id: string, updateDatabaseDto: UpdateDatabaseDTO) {
    const { name, enabled } = updateDatabaseDto;
    const database = await this.db.getDocument('databases', id);

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    const updatedDatabase = await this.db.updateDocument(
      'databases',
      id,
      database
        .setAttribute('name', name)
        .setAttribute('enabled', enabled)
        .setAttribute('search', `${id} ${name}`),
    );

    // Assuming you have a queue for events
    // queueForEvents.setParam('databaseId', updatedDatabase.getId());

    return updatedDatabase;
  }

  async remove(id: string) {
    const database = await this.db.getDocument('databases', id);

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    if (!(await this.db.deleteDocument('databases', id))) {
      throw new Exception(
        Exception.GENERAL_SERVER_ERROR,
        'Failed to remove collection from DB',
      );
    }

    this.db.purgeCachedDocument('databases', database.getId());
    this.db.purgeCachedCollection(`databases_${database.getInternalId()}`);

    // TODO: Remove all documents from thRemove all documents from the collectione collection

    return null;
  }

  /**
   * Get logs for a database.
   */
  async getLogs(databaseId: string, queries: Query[], search?: string) {
    const database = await this.db.getDocument('databases', databaseId);

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    const grouped = Query.groupByType(queries);
    const limit = grouped.limit ?? APP_LIMIT_COUNT;
    const offset = grouped.offset ?? 0;

    // const audit = new Audit(this.db);
    const resource = `database/${databaseId}`;
    const logs = []; //await audit.getLogsByResource(resource, limit, offset);

    const output = logs.map((log) => {
      const detector = new Detector(log.userAgent || 'UNKNOWN');
      detector.skipBotDetection();

      const os = detector.getOS();
      const client = detector.getClient();
      const device = detector.getDevice();

      return new Document({
        event: log.event,
        userId: log.data.userId,
        userEmail: log.data.userEmail ?? null,
        userName: log.data.userName ?? null,
        mode: log.data.mode ?? null,
        ip: log.ip,
        time: log.time,
        osCode: os.osCode,
        osName: os.osName,
        osVersion: os.osVersion,
        clientType: client.clientType,
        clientCode: client.clientCode,
        clientName: client.clientName,
        clientVersion: client.clientVersion,
        clientEngine: client.clientEngine,
        clientEngineVersion: client.clientEngineVersion,
        deviceName: device.deviceName,
        deviceBrand: device.deviceBrand,
        deviceModel: device.deviceModel,
        countryCode: this.geoDb.get(log.ip)?.country?.iso_code ?? '--',
        countryName: 'Unknown', // Placeholder, replace with actual geolocation logic
      });
    });

    return {
      total: [], //await audit.countLogsByResource(resource),
      logs: output,
    };
  }

  /**
   * Create a new collection.
   */
  async createCollection(databaseId: string, input: CreateCollectionDTO) {
    const { name, enabled, documentSecurity } = input;
    let { collectionId, permissions } = input;

    const database = await Authorization.skip(
      async () => await this.db.getDocument('databases', databaseId),
    );

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    permissions = Permission.aggregate(permissions);
    collectionId = collectionId === 'unique()' ? ID.unique() : collectionId;

    try {
      await this.db.createDocument(
        `database_${database.getInternalId()}`,
        new Document({
          $id: collectionId,
          databaseInternalId: database.getInternalId(),
          databaseId: databaseId,
          $permissions: permissions ?? [],
          documentSecurity: documentSecurity,
          enabled: enabled ?? true,
          name,
          search: `${collectionId} ${name}`,
        }),
      );

      const collection = await this.db.getDocument(
        `database_${database.getInternalId()}`,
        collectionId,
      );

      await this.db.createCollection(
        `database_${database.getInternalId()}_collection_${collection.getInternalId()}`,
        [],
        [],
        permissions ?? [],
        documentSecurity,
      );

      // Assuming you have a queue for events
      // queueForEvents.setContext('database', database).setParam('databaseId', databaseId).setParam('collectionId', collection.getId());

      return collection;
    } catch (error) {
      if (error instanceof DuplicateException) {
        throw new Exception(Exception.COLLECTION_ALREADY_EXISTS);
      }
      if (error instanceof LimitException) {
        throw new Exception(Exception.COLLECTION_LIMIT_EXCEEDED);
      }
      throw error;
    }
  }

  /**
   * Get collections for a database.
   */
  async getCollections(databaseId: string, queries: Query[], search?: string) {
    const database = await Authorization.skip(
      async () => await this.db.getDocument('databases', databaseId),
    );

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    if (search) {
      queries.push(Query.search('search', search));
    }

    const cursor = queries.find((query) =>
      [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(
        query.getMethod(),
      ),
    );

    if (cursor) {
      const collectionId = cursor.getValue();
      const cursorDocument = await this.db.getDocument(
        `database_${database.getInternalId()}`,
        collectionId,
      );

      if (cursorDocument.isEmpty()) {
        throw new Exception(
          Exception.GENERAL_CURSOR_NOT_FOUND,
          `Collection '${collectionId}' for the 'cursor' value not found.`,
        );
      }

      cursor.setValue(cursorDocument);
    }

    const filterQueries = Query.groupByType(queries).filters;

    const collections = await this.db.find(
      `database_${database.getInternalId()}`,
      queries,
    );
    const total = await this.db.count(
      `database_${database.getInternalId()}`,
      filterQueries,
      APP_LIMIT_COUNT,
    );

    return {
      collections,
      total,
    };
  }

  /**
   * Find one collection.
   */
  async getCollection(databaseId: string, collectionId: string) {
    const database = await Authorization.skip(
      async () => await this.db.getDocument('databases', databaseId),
    );

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    const collection = await this.db.getDocument(
      `database_${database.getInternalId()}`,
      collectionId,
    );

    if (collection.isEmpty()) {
      throw new Exception(Exception.COLLECTION_NOT_FOUND);
    }

    return collection;
  }

  /**
   * Get logs for a collection.
   */
  async getCollectionLogs(
    databaseId: string,
    collectionId: string,
    queries: Query[],
  ) {
    const database = await Authorization.skip(
      async () => await this.db.getDocument('databases', databaseId),
    );

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    const collectionDocument = await this.db.getDocument(
      `database_${database.getInternalId()}`,
      collectionId,
    );
    const collection = await this.db.getCollection(
      `database_${database.getInternalId()}_collection_${collectionDocument.getInternalId()}`,
    );

    if (collection.isEmpty()) {
      throw new Exception(Exception.COLLECTION_NOT_FOUND);
    }

    const grouped = Query.groupByType(queries);
    const limit = grouped.limit ?? APP_LIMIT_COUNT;
    const offset = grouped.offset ?? 0;

    // const audit = new Audit(this.db);
    const resource = `database/${databaseId}/collection/${collectionId}`;
    const logs = []; //await audit.getLogsByResource(resource, limit, offset);

    const output = logs.map((log) => {
      const detector = new Detector(log.userAgent || 'UNKNOWN');
      detector.skipBotDetection();

      const os = detector.getOS();
      const client = detector.getClient();
      const device = detector.getDevice();

      return new Document({
        event: log.event,
        userId: log.data.userId,
        userEmail: log.data.userEmail ?? null,
        userName: log.data.userName ?? null,
        mode: log.data.mode ?? null,
        ip: log.ip,
        time: log.time,
        osCode: os.osCode,
        osName: os.osName,
        osVersion: os.osVersion,
        clientType: client.clientType,
        clientCode: client.clientCode,
        clientName: client.clientName,
        clientVersion: client.clientVersion,
        clientEngine: client.clientEngine,
        clientEngineVersion: client.clientEngineVersion,
        deviceName: device.deviceName,
        deviceBrand: device.deviceBrand,
        deviceModel: device.deviceModel,
        countryCode: this.geoDb.get(log.ip)?.country?.iso_code ?? '--',
        countryName: 'Unknown', // Placeholder, replace with actual geolocation logic
      });
    });

    return {
      total: [], //await audit.countLogsByResource(resource),
      logs: output,
    };
  }

  /**
   * Update a collection.
   */
  async updateCollection(
    databaseId: string,
    collectionId: string,
    input: UpdateCollectionDTO,
  ) {
    const { name, documentSecurity } = input;
    let { permissions, enabled } = input;

    const database = await Authorization.skip(
      async () => await this.db.getDocument('databases', databaseId),
    );

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    const collection = await this.db.getDocument(
      `database_${database.getInternalId()}`,
      collectionId,
    );

    if (collection.isEmpty()) {
      throw new Exception(Exception.COLLECTION_NOT_FOUND);
    }

    permissions = Permission.aggregate(permissions);
    enabled = enabled ?? collection.getAttribute('enabled');

    const updatedCollection = await this.db.updateDocument(
      `database_${database.getInternalId()}`,
      collectionId,
      collection
        .setAttribute('name', name)
        .setAttribute('$permissions', permissions)
        .setAttribute('documentSecurity', documentSecurity)
        .setAttribute('enabled', enabled)
        .setAttribute('search', `${collectionId} ${name}`),
    );

    await this.db.updateCollection(
      `database_${database.getInternalId()}_collection_${collection.getInternalId()}`,
      permissions,
      documentSecurity,
    );
    // Assuming you have a queue for events
    // queueForEvents.setContext('database', database).setParam('databaseId', databaseId).setParam('collectionId', collectionId);

    return updatedCollection;
  }

  /**
   * Remove a collection.
   */
  async removeCollection(databaseId: string, collectionId: string) {
    const database = await Authorization.skip(
      async () => await this.db.getDocument('databases', databaseId),
    );

    if (database.isEmpty()) {
      throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    const collection = await this.db.getDocument(
      `database_${database.getInternalId()}`,
      collectionId,
    );

    if (collection.isEmpty()) {
      throw new Exception(Exception.COLLECTION_NOT_FOUND);
    }

    if (
      !(await this.db.deleteDocument(
        `database_${database.getInternalId()}`,
        collectionId,
      ))
    ) {
      throw new Exception(
        Exception.GENERAL_SERVER_ERROR,
        'Failed to remove collection from DB',
      );
    }

    await this.db.purgeCachedCollection(
      `database_${database.getInternalId()}_collection_${collection.getInternalId()}`,
    );

    return null;
  }
}
