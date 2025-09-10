import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SchemasService } from './schemas.service';
import { SchemasController } from './schemas.controller';
import { SchemaHook } from '@nuvix/core/resolvers/hooks/schema.hook';
import { CollectionsModule } from './collections/collections.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueFor } from '@nuvix/utils';
import {
  ProjectHook,
  HostHook,
  CorsHook,
  AuthHook,
  ApiHook,
  StatsHook,
  AuditHook,
  LogsHook,
} from '@nuvix/core/resolvers';

@Module({
  imports: [
    CollectionsModule,
    BullModule.registerQueue({ name: QueueFor.STATS }),
  ],
  controllers: [SchemasController],
  providers: [SchemasService],
})
export class SchemasModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProjectHook, HostHook)
      .forRoutes(SchemasController)
      .apply(CorsHook)
      .forRoutes('*')
      .apply(AuthHook, ApiHook, SchemaHook, StatsHook, AuditHook)
      .forRoutes(SchemasController)
      .apply(LogsHook)
      .forRoutes('*');
  }
}
