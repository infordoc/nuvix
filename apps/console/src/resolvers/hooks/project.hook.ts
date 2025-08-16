import { Injectable, Logger } from '@nestjs/common';
import { Doc } from '@nuvix-tech/db';

import { PROJECT } from '@nuvix/utils';
import { Hook } from '@nuvix/core/server';

@Injectable()
export class ProjectHook implements Hook {
  private readonly logger = new Logger(ProjectHook.name);
  constructor() { }

  async onRequest(req: NuvixRequest, reply: NuvixRes) {
    req[Context.Project] = new Doc({ $id: 'console' });
    return null;
  }
}
