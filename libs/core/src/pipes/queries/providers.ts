import { BaseQueryPipe } from './base'

export class Providers extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'name',
    'provider',
    'type',
    'enabled',
  ]

  public constructor() {
    super('providers', Providers.ALLOWED_ATTRIBUTES)
  }
}
