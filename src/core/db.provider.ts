import { FactoryProvider, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Exception } from './extend/exception';
import { Request } from 'express';

// Services
import { Project } from 'src/projects/schemas/project.schema';
import { ClsService, ClsServiceManager } from 'nestjs-cls';
import { PROJECT } from 'src/Utils/constants';
import { Database, MariaDB } from '@nuvix/database';


export const connectionFactory: FactoryProvider = {
  provide: 'CONNECTION',
  scope: Scope.REQUEST,
  durable: true,
  useFactory: async (
    cls: ClsService,
  ) => {
    const logger = cls.get('logger') as Logger;
    const project = cls.get(PROJECT) as Project;
    const tenantId = project.database;

    let adapter = new MariaDB({
      connection: {
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: "college1_test99",
        port: 3306,
      }
    })

    await adapter.init();

    let connection = new Database(adapter);

    await connection.ping();

    if (tenantId) {
      // WILL USE Database class FOR MULTITENANCY
    }

    return null;
  },
  inject: [ClsService],
};

const defaultConnectionOptions = {
  type: 'postgres',
  logging: true,
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: true,
}

export class DbService {

}
