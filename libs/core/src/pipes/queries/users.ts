import { BaseQueryPipe } from './base'

export class Users extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'name',
    'email',
    'phone',
    'status',
    'passwordUpdate',
    'registration',
    'emailVerification',
    'phoneVerification',
    'labels',
  ]

  public constructor() {
    super('users', Users.ALLOWED_ATTRIBUTES)
  }
}
