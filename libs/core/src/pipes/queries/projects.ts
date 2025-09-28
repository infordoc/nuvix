import { BaseQueryPipe } from './base'

export class Projects extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = ['name', 'teamId']

  public constructor() {
    super('projects', Projects.ALLOWED_ATTRIBUTES)
  }
}
