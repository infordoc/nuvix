import { BaseQueryPipe } from './base'

export class Migrations extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'status',
    'stage',
    'source',
    'destination',
    'resources',
    'statusCounters',
    'resourceData',
    'errors',
  ]

  public constructor() {
    super('migrations', Migrations.ALLOWED_ATTRIBUTES)
  }
}
