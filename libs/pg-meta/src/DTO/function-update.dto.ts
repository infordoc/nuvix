import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class FunctionUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  schema?: string;

  @IsOptional()
  @IsString()
  definition?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsArray()
  arguments?: any[];

  @IsOptional()
  @IsString()
  return_type?: string;

  @IsOptional()
  @IsEnum(['IMMUTABLE', 'STABLE', 'VOLATILE'])
  behavior?: 'IMMUTABLE' | 'STABLE' | 'VOLATILE';

  @IsOptional()
  @IsBoolean()
  security_definer?: boolean;

  @IsOptional()
  @IsString()
  comment?: string;
}
