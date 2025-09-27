import { BaseQueryPipe } from './base'

export class Topics extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'name',
    'description',
    'emailTotal',
    'smsTotal',
    'pushTotal',
  ]

  public constructor() {
    super('topics', Topics.ALLOWED_ATTRIBUTES)
  }
}
