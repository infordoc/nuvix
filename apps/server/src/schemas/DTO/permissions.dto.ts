import { IsString } from 'class-validator'

export class PermissionsDTO {
  /**
   * An array of permissions strings. [Learn more about permissions](https://docs.nuvix.in/permissions).'
   */
  @IsString({ each: true })
  declare permissions: string[]
}
