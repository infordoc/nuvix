import { Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { GetProjectDbFn } from 'src/core/core.module';
import {
  GET_PROJECT_DB,
  MESSAGING_SCHEMA_DB,
  PROJECT,
  PROJECT_POOL,
} from 'src/Utils/constants';

@Injectable()
export class MessagingInterceptor implements NestInterceptor {
  constructor(
    @Inject(GET_PROJECT_DB) private readonly getProjectDB: GetProjectDbFn,
  ) {}

  intercept(context: any, next: any) {
    const request = context.switchToHttp().getRequest();
    const project = request[PROJECT] as Document;
    const pool = request[PROJECT_POOL];
    const db = this.getProjectDB(pool, project.getId());
    db.setDatabase('messaging');
    request[MESSAGING_SCHEMA_DB] = db;
    return next.handle();
  }
}
