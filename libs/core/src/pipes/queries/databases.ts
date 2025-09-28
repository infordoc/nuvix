import { BaseQueryPipe } from './base'

export class Databases extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = ['name']

  public constructor() {
    super('databases', Databases.ALLOWED_ATTRIBUTES)
  }
}
