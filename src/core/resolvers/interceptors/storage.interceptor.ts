import { Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { GetProjectDbFn } from 'src/core/core.module';
import { PROJECT, PROJECT_POOL, STORAGE_SCHEMA_DB } from 'src/Utils/constants';

@Injectable()
export class StorageInterceptor implements NestInterceptor {
  constructor(@Inject() private readonly getProjectDB: GetProjectDbFn) {}

  intercept(context: any, next: any) {
    const request = context.switchToHttp().getRequest();
    const project = request[PROJECT] as Document;
    const pool = request[PROJECT_POOL];
    const db = this.getProjectDB(pool, project.getId());
    db.setDatabase('storage');
    request[STORAGE_SCHEMA_DB] = db;
    return next.handle();
  }
}
