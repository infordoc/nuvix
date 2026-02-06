import { Injectable } from '@nestjs/common'
import { CoreService } from '@nuvix/core'
import { Database } from '@nuvix/db'

@Injectable()
export class TemplatesService {
  private readonly db: Database

  constructor(private coreService: CoreService) {
    this.db = this.coreService.getPlatformDb()
  }
}
