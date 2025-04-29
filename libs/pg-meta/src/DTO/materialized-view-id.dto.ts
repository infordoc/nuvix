import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class MaterializedViewIdParamDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  id: number;
}
