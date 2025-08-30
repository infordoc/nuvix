import { BaseQueryPipe } from './base';

export class Deployments extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'buildSize',
    'sourceSize',
    'totalSize',
    'buildDuration',
    'status',
    'activate',
    'type',
  ];

  public constructor() {
    super('deployments', Deployments.ALLOWED_ATTRIBUTES);
  }
}
