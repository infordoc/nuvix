import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Document } from '@nuvix/database';
import { GetProjectDbFn } from 'src/core/core.module';
import {
  GET_PROJECT_DB,
  PROJECT,
  PROJECT_POOL,
  STORAGE_SCHEMA_DB,
} from 'src/Utils/constants';

@Injectable()
export class StorageInterceptor implements NestInterceptor {
  constructor(
    @Inject(GET_PROJECT_DB) private readonly getProjectDB: GetProjectDbFn,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const project = request[PROJECT] as Document;
    const pool = request[PROJECT_POOL];
    const db = this.getProjectDB(pool, project.getId());
    db.setDatabase('storage');
    request[STORAGE_SCHEMA_DB] = db;
    return next.handle();
  }
}
