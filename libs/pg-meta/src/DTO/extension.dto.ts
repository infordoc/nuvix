import { IsInt, IsOptional } from 'class-validator';

export class ExtensionQueryDto {
  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;
}
