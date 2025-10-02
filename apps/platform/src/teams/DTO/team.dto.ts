import { OmitType, PartialType } from '@nestjs/swagger'
import { IsString, Length, IsOptional, IsObject } from 'class-validator'
import { IsCustomID, IsUID } from '@nuvix/core/validators'

export class CreateTeamDTO {
  /**
   * Team ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.
   */
  @IsCustomID()
  declare teamId: string

  /**
   * Team name. Max length: 128 chars.
   */
  @IsString()
  @Length(1, 128, {
    message: 'Team name must be between 1 and 128 characters long.',
  })
  declare name: string
}

export class UpdateTeamDTO extends PartialType(
  OmitType(CreateTeamDTO, ['teamId'] as const),
) {}

export class UpdateTeamPrefsDTO {
  /**
   * Prefs key-value JSON object.
   */
  @IsOptional()
  @IsObject()
  prefs?: Record<string, any>
}

// Params

export class TeamsParamDTO {
  /**
   * Team ID.
   */
  @IsUID()
  declare teamId: string
}
