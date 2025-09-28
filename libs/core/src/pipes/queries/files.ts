import { BaseQueryPipe } from './base'

export class Files extends BaseQueryPipe {
  public static override ALLOWED_ATTRIBUTES = [
    'name',
    'signature',
    'mimeType',
    'sizeOriginal',
    'chunksTotal',
    'chunksUploaded',
  ]

  public constructor() {
    super('files', Files.ALLOWED_ATTRIBUTES)
  }
}
