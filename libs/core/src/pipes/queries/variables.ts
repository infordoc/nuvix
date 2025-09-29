import { BaseQueryPipe } from './base'

export class Variables extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'key',
    'resourceType',
    'resourceId',
  ]

  public constructor() {
    super('variables', Variables.ALLOWED_ATTRIBUTES)
  }
}
