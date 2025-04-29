import { IsOptional, IsString } from 'class-validator';

export class ExtensionUpdateDto {
  @IsOptional()
  @IsString()
  schema?: string;

  @IsOptional()
  @IsString()
  version?: string;
}
