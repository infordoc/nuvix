import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Document } from '@nuvix/database';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { Exception } from 'src/core/extend/exception';
import { PROJECT, USER } from 'src/Utils/constants';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly store: ClsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const logger = this.store.get('logger') as Logger;

    const user = req.user ? new Document(req.user) : new Document();

    req[USER] = user;

    next();
  }
}
