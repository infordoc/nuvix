import { IsBooleanString, IsOptional } from 'class-validator';

export class SchemaDeleteQueryDto {
  @IsOptional()
  @IsBooleanString()
  cascade?: boolean;
}
