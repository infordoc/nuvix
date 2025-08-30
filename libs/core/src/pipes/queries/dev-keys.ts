import { BaseQueryPipe } from './base';

export class DevKeys extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = ['accessedAt', 'expire'];

  public constructor() {
    super('devKeys', DevKeys.ALLOWED_ATTRIBUTES);
  }
}
