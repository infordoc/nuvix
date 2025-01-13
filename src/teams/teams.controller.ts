import { Controller, UseInterceptors } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { ResolverInterceptor } from 'src/core/resolver/response.resolver';

@Controller({ version: ['1'], path: 'teams' })
@UseInterceptors(ResolverInterceptor)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) { }
}
