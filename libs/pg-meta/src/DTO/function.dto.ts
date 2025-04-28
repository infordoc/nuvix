import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class FunctionQueryDto {
  @IsOptional()
  @IsBoolean()
  includeSystemSchemas?: boolean;

  @IsOptional()
  @IsString()
  includedSchemas?: string;

  @IsOptional()
  @IsString()
  excludedSchemas?: string;

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;
}
