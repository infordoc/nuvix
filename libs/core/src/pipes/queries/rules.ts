import { BaseQueryPipe } from './base';

export class Rules extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = [
    'domain',
    'type',
    'trigger',
    'deploymentResourceType',
    'deploymentResourceId',
    'deploymentId',
    'deploymentVcsProviderBranch',
  ];

  public constructor() {
    super('rules', Rules.ALLOWED_ATTRIBUTES);
  }
}
