import { Module } from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseResolver } from './base.resolver';
import { MongooseModule } from '@nestjs/mongoose';

// Importing the schemas and models
import { UserSchema, User } from './schemas/server.schema';
import { IdentitiesSchema, Identities } from './schemas/server.schema';
import { SessionSchema, Session } from './schemas/server.schema';
import { OrganizationSchema, Organization } from './schemas/server.schema';
import { ProjectSchema, Project } from './schemas/server.schema';
import { DatabaseSchema, Database } from './schemas/server.schema';
import { CollectionSchema, Collection } from './schemas/server.schema';


@Module({
  providers: [BaseResolver, BaseService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Identities.name, schema: IdentitiesSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Database.name, schema: DatabaseSchema },
      { name: Collection.name, schema: CollectionSchema },
    ], 'server'),
  ]
})
export class BaseModule { }
