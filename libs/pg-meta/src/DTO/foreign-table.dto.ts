import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class ForeignTableQueryDto {
  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;

  @IsOptional()
  @IsBoolean()
  includeColumns?: boolean;
}
