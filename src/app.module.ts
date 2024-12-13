import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './account/account.module';
import { SessionModule } from './session/session.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { config } from 'dotenv';
import { BaseModule } from './base/base.module';

config();


class CustomLogger {
  debug(message?: any): void {
    console.debug(message);
  }
  info(message?: any): void {
    console.info(message);
  }
  warn(message?: any): void {
    console.warn(message);
  }
  error(message?: any): void {
    console.error(message);
  }
}

const customLogger = new CustomLogger();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      logging: true,
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [],
      synchronize: true,
      timezone: 'Z',
      extra: {
        timezone: 'Z'
      }
    }),
    TypeOrmModule.forRoot({
      name: 'mongo',
      type: 'mongodb',
      logging: true,
      url: process.env.MONGO_URL,
      autoLoadEntities: true,
      entities: [],
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      logger: customLogger,
      installSubscriptionHandlers: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            name: 'upper',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
    }),
    BaseModule,
    UserModule,
    AccountModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }