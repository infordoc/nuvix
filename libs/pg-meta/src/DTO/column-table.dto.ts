import { Type } from 'class-transformer';
import { Allow, IsNumber, IsOptional, IsString } from 'class-validator';

export class ColumnTableParams {
  @Type(() => Number)
  @IsNumber()
  tableId: number;

  @IsOptional()
  @IsString()
  ordinalPosition: string;
}
