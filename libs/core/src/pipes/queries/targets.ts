import { BaseQueryPipe } from './base'

export class Targets extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'userId',
    'providerId',
    'identifier',
    'providerType',
  ]

  public constructor() {
    super('targets', Targets.ALLOWED_ATTRIBUTES)
  }
}
