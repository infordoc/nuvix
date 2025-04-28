import { IsOptional, IsString } from 'class-validator';

export class ExtensionCreateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  schema?: string;

  @IsOptional()
  @IsString()
  version?: string;
}
