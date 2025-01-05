import { Module } from '@nestjs/common';
import { ConsoleService } from './console.service';
import { ConsoleController } from './console.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from './schemas/plan.schema';

@Module({
  controllers: [ConsoleController],
  providers: [ConsoleService],
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
    ], 'server'),
  ],
})
export class ConsoleModule {}
