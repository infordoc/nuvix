import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class FunctionCreateDto {
  @IsString()
  name: string;

  @IsString()
  schema: string;

  @IsString()
  definition: string;

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
