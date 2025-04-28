import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ForeignTableIdParamDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  id: number;
}
