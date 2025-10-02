import { Injectable } from '@nestjs/common'
import { Database } from '@nuvix/db'
import { CoreService } from '@nuvix/core'

@Injectable()
export class TemplatesService {
  private readonly db: Database

  constructor(private coreService: CoreService) {
    this.db = this.coreService.getPlatformDb()
  }
}
