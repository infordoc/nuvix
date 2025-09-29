import { BaseQueryPipe } from './base'

export class Messages extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'scheduledAt',
    'deliveredAt',
    'deliveredTotal',
    'status',
    'description',
    'providerType',
  ]

  public constructor() {
    super('messages', Messages.ALLOWED_ATTRIBUTES)
  }
}
