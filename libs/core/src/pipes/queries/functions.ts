import { BaseQueryPipe } from './base';

export class Functions extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'name',
    'enabled',
    'runtime',
    'deploymentId',
    'schedule',
    'scheduleNext',
    'schedulePrevious',
    'timeout',
    'entrypoint',
    'commands',
    'installationId',
  ];

  public constructor() {
    super('functions', Functions.ALLOWED_ATTRIBUTES);
  }
}
