import { IsUID } from '@nuvix/core/validators'

export class SessionParamDTO {
  /**
   * Session ID.
   */
  @IsUID()
  declare sessionId: string
}
