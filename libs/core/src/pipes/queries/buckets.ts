import { BaseQueryPipe } from './base';

export class Buckets extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'enabled',
    'name',
    'fileSecurity',
    'maximumFileSize',
    'encryption',
    'antivirus',
  ];

  constructor() {
    super('buckets', Buckets.ALLOWED_ATTRIBUTES);
  }
}
