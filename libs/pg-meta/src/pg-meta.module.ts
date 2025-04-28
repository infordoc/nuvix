import { Module } from '@nestjs/common';
import { PgMetaService } from './pg-meta.service';
import { PgMetaController } from './pg-meta.controller';

@Module({
  providers: [PgMetaService],
  exports: [PgMetaService],
  controllers: [PgMetaController],
})
export class PgMetaModule {}
