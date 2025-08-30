import { BaseQueryPipe } from './base';

export class Logs extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'status',
    'responseStatusCode',
    'duration',
    'requestMethod',
    'requestPath',
    'deploymentId',
  ];

  public constructor() {
    super('executions', Logs.ALLOWED_ATTRIBUTES); //TODO: Update this later
  }
}
