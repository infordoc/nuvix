import { BaseQueryPipe } from './base'

export class Teams extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = ['name', 'total', 'billingPlan']

  public constructor() {
    super('teams', Teams.ALLOWED_ATTRIBUTES)
  }
}
