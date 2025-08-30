import { BaseQueryPipe } from './base';

export class Attributes extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'key',
    'type',
    'size',
    'required',
    'array',
    'status',
    'error',
  ];

  constructor() {
    super('attributes', Attributes.ALLOWED_ATTRIBUTES);
  }
}
