import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { connectionFactory } from 'src/core/db.provider';
import { GlobalMongooseModule } from 'src/core/resolver/mongoose.resolver';
import { Project, ProjectSchema } from 'src/projects/schemas/project.schema';

@Module({
  controllers: [UsersController],
  providers: [UsersService, connectionFactory],
  imports: [
    GlobalMongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema }
    ], 'server')
  ]
})
export class UsersModule { }
