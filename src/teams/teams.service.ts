import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { DataSource, Repository } from 'typeorm';

import { TeamEntity } from 'src/core/entities/users/team.entity';
import { MembershipEntity } from 'src/core/entities/users/membership.entity';

@Injectable()
export class TeamsService {
  private logger: Logger = new Logger(TeamsService.name)
  private readonly teamRepo: Repository<TeamEntity>
  private readonly membershipsRepo: Repository<MembershipEntity>

  constructor(
    @Inject('CONNECTION') private readonly dataSource: DataSource,
    private readonly cls: ClsService,
  ) {
    this.teamRepo = this.dataSource.getRepository(TeamEntity)
    this.membershipsRepo = this.dataSource.getRepository(MembershipEntity)
  }


}
