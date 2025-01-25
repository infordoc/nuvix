import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Authorization, Database, Document } from '@nuvix/database';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { Exception } from 'src/core/extend/exception';
import { Auth } from 'src/core/helper/auth.helper';
import { DB_FOR_CONSOLE, PROJECT, USER } from 'src/Utils/constants';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly store: ClsService,
    @Inject(DB_FOR_CONSOLE) readonly db: Database,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const logger = this.store.get('logger') as Logger;

    const projectId = (req.projectId =
      (Array.isArray(req.headers['x-nuvix-project'])
        ? req.headers['x-nuvix-project'][0]
        : req.headers['x-nuvix-project']) ?? 'console');

    if (projectId === 'console') {
      req.user = await this.db.findOne('users');

      const user = req.user ? req.user : new Document();

      const roles = Auth.getRoles(user);

      for (const role in roles) {
        Authorization.setRole(role);
      }

      req[USER] = user;
    } else {
      req.user = new Document();
    }

    next();
  }
}
