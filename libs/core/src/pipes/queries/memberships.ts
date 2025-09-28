import { BaseQueryPipe } from './base'

export class Memberships extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'userId',
    'teamId',
    'invited',
    'joined',
    'confirm',
    'roles',
  ]

  /**
   * Expression constructor
   */
  public constructor() {
    super('memberships', Memberships.ALLOWED_ATTRIBUTES)
  }
}
