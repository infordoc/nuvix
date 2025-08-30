import { BaseQueryPipe } from './base';

export class Indexes extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'key',
    'type',
    'status',
    'attributes',
    'error',
  ];

  public constructor() {
    super('indexes', Indexes.ALLOWED_ATTRIBUTES);
  }
}
