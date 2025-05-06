import { IsBoolean, IsBooleanString, IsOptional } from 'class-validator';

export class TableDeleteQueryDto {
  @IsOptional()
  @IsBooleanString()
  cascade?: boolean;
}
