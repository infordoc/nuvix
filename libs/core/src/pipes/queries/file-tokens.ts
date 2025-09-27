import { BaseQueryPipe } from './base'

export class FileTokens extends BaseQueryPipe {
  public static ALLOWED_ATTRIBUTES = ['expire']

  public constructor() {
    super('files', FileTokens.ALLOWED_ATTRIBUTES)
  }
}
