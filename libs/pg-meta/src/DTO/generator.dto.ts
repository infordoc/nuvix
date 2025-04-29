import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GeneratorQueryDto {
  @IsOptional()
  @IsString()
  excludedSchemas?: string;

  @IsOptional()
  @IsString()
  includedSchemas?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  detectOneToOneRelationships?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['internal', 'public', 'private', 'package'])
  access_control?: 'internal' | 'public' | 'private' | 'package';
}
