import { BaseQueryPipe } from './base'

export class Indexes extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'key',
    'type',
    'status',
    'attributes',
    'error',
  ]

  public constructor() {
    super('indexes', Indexes.ALLOWED_ATTRIBUTES)
  }
}
