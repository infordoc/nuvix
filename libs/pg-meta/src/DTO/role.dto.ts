import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class RoleQueryDto {
  @IsOptional()
  @IsBoolean()
  includeDefaultRoles?: boolean;

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;
}
