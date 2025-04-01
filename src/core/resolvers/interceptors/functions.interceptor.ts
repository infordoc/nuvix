import { Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { GetProjectDbFn } from 'src/core/core.module';
import {
  FUNCTIONS_SCHEMA_DB,
  PROJECT,
  PROJECT_POOL,
} from 'src/Utils/constants';

@Injectable()
export class FunctionsInterceptor implements NestInterceptor {
  constructor(@Inject() private readonly getProjectDB: GetProjectDbFn) {}

  intercept(context: any, next: any) {
    const request = context.switchToHttp().getRequest();
    const project = request[PROJECT] as Document;
    const pool = request[PROJECT_POOL];
    const db = this.getProjectDB(pool, project.getId());
    db.setDatabase('functions');
    request[FUNCTIONS_SCHEMA_DB] = db;
    return next.handle();
  }
}
