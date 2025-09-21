import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMfaStatusDTO {
  @IsNotEmpty()
  @IsBoolean()
  mfa!: boolean;
}
