import { BaseQueryPipe } from './base'
import { Logs } from './logs'

export class Installations extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = ['provider', 'organization']

  public constructor() {
    super('installations', Logs.ALLOWED_ATTRIBUTES)
  }
}
