import { BaseQueryPipe } from './base';

export class Identities extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'userId',
    'provider',
    'providerUid',
    'providerEmail',
    'providerAccessTokenExpiry',
  ];

  public constructor() {
    super('identities', Identities.ALLOWED_ATTRIBUTES);
  }
}
