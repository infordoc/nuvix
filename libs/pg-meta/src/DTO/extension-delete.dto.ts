import { IsBoolean, IsOptional } from 'class-validator';

export class ExtensionDeleteQueryDto {
  @IsOptional()
  @IsBoolean()
  cascade?: boolean;
}
