import { BaseQueryPipe } from './base';

export class Databases extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = ['name'];

  public constructor() {
    super('databases', Databases.ALLOWED_ATTRIBUTES);
  }
}
