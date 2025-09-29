import { BaseQueryPipe } from './base'

export class DevKeys extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = ['accessedAt', 'expire']

  public constructor() {
    super('devKeys', DevKeys.ALLOWED_ATTRIBUTES)
  }
}
