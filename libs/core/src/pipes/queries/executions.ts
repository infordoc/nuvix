import { BaseQueryPipe } from './base'

export class Executions extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'trigger',
    'status',
    'responseStatusCode',
    'duration',
    'requestMethod',
    'requestPath',
    'deploymentId',
  ]

  public constructor() {
    super('executions', Executions.ALLOWED_ATTRIBUTES)
  }
}
