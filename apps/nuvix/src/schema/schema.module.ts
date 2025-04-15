import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { SchemaController } from './schema.controller';
import { SchemaHook } from '@nuvix/core/resolvers/hooks/schema.hook';

@Module({
  controllers: [SchemaController],
  providers: [SchemaService],
})
export class SchemaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SchemaHook).forRoutes(SchemaController);
  }
}
