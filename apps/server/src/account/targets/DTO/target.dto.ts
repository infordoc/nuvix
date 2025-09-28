import { OmitType } from '@nestjs/swagger'
import { IsCustomID, IsUID } from '@nuvix/core/validators'
import { Database } from '@nuvix/db'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreatePushTargetDTO {
  /**
   * Target ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.
   */
  @IsCustomID()
  declare targetId: string

  /**
   * The target identifier (token, email, phone etc.)
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(Database.LENGTH_KEY)
  declare identifier: string

  /**
   * Provider ID. Message will be sent to this target from the specified provider ID. If no provider ID is set the first setup provider will be used.
   */
  @IsOptional()
  @IsUID()
  providerId?: string
}

export class UpdatePushTargetDTO extends OmitType(CreatePushTargetDTO, [
  'targetId',
  'providerId',
] as const) {}

export class TargetIdParamDTO {
  /**
   * Target ID.
   */
  @IsUID()
  declare targetId: string
}
