import { IsUID } from '@nuvix/core/validators';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePushTargetDTO {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsOptional()
  @IsString()
  @IsUID()
  providerId?: string;
}

export class TargetIdParamDTO {
  @IsString()
  @IsNotEmpty()
  @IsUID()
  targetId: string;
}
