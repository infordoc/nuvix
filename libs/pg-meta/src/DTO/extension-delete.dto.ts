import { TransformStringToBoolean } from '@nuvix/core/validators';
import { IsBoolean, IsOptional } from 'class-validator';

export class ExtensionDeleteQueryDto {
  @IsOptional()
  @TransformStringToBoolean()
  @IsBoolean()
  cascade?: boolean;
}
