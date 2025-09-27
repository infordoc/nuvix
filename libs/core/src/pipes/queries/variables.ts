import { BaseQueryPipe } from './base'

export class Variables extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = ['key', 'resourceType', 'resourceId']

  public constructor() {
    super('variables', Variables.ALLOWED_ATTRIBUTES)
  }
}
