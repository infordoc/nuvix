import { IsUID } from '@nuvix/core/validators/input.validator'

export class IdentityIdParamDTO {
  /**
   * Identity ID.
   */
  @IsUID()
  declare identityId: string
}
