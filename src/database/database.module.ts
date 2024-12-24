import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema, Database, DatabaseSchema } from './schemas/database.schema';

@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService],
  imports: [
    MongooseModule.forFeature([
      { name: Database.name, schema: DatabaseSchema },
      { name: Collection.name, schema: CollectionSchema },
    ], 'server')
  ]
})
export class DatabaseModule { }
