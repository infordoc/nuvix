import { configuration } from '@nuvix/utils'
import { ArrayMaxSize, IsArray, IsInt, Max, Min } from 'class-validator'

export class CreateJwtDTO {
  /**
   * Api Scopes.
   */
  @IsArray()
  @ArrayMaxSize(configuration.limits.arrayParamsSize)
  declare scopes: string[]

  /**
   * Duration in seconds (max 1 hour).
   */
  @IsInt()
  @Min(0)
  @Max(3600)
  declare duration: number
}
