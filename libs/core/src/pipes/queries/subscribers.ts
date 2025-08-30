import { BaseQueryPipe } from './base';

export class Subscribers extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'targetId',
    'topicId',
    'userId',
    'providerType',
  ];

  public constructor() {
    super('subscribers', Subscribers.ALLOWED_ATTRIBUTES);
  }
}
