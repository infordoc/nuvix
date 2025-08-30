import { BaseQueryPipe } from './base';

export class Collections extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = ['name', 'enabled', 'documentSecurity'];

  public constructor() {
    super('collections', Collections.ALLOWED_ATTRIBUTES);
  }
}
