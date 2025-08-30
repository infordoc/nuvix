import { BaseQueryPipe } from './base';

export class Providers extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = ['name', 'provider', 'type', 'enabled'];

  public constructor() {
    super('providers', Providers.ALLOWED_ATTRIBUTES);
  }
}
