import { IsUID } from '@nuvix/core/validators/input.validator';
import { IsNotEmpty, IsString } from 'class-validator';

export class IdentityIdParamDTO {
  @IsString()
  @IsNotEmpty()
  @IsUID()
  identityId: string;
}
