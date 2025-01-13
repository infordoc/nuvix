import { Body, Controller, Delete, Get, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { ResolverInterceptor, ResponseType } from 'src/core/resolver/response.resolver';
import { Response } from 'src/core/helper/response.helper';
import { CreateTeamDto, UpdateTeamDto, UpdateTeamPrefsDto } from './dto/team.dto';
import { User } from 'src/core/resolver/user.resolver';
import { UserEntity } from 'src/core/entities/users/user.entity';
import { CreateMembershipDto } from './dto/membership.dto';

@Controller({ version: ['1'], path: 'teams' })
@UseInterceptors(ResolverInterceptor)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) { }

  @Get()
  @ResponseType({ type: Response.MODEL_TEAM, list: true })
  async findAll(
    @Query('query') query: string,
  ) {
    return await this.teamsService.findAll();
  }

  @Post()
  @ResponseType({ type: Response.MODEL_TEAM })
  async create(
    @User() user: UserEntity | null,
    @Body() input: CreateTeamDto
  ) {
    return await this.teamsService.create(user, input);
  }

  @Get(':id')
  @ResponseType({ type: Response.MODEL_TEAM })
  async findOne(
    @Query('id') id: string
  ) {
    return await this.teamsService.findOne(id);
  }

  @Put(':id')
  @ResponseType({ type: Response.MODEL_TEAM })
  async update(
    @Query('id') id: string,
    @Body() input: UpdateTeamDto
  ) {
    return await this.teamsService.update(id, input);
  }

  @Delete(':id')
  @ResponseType({ type: Response.MODEL_NONE })
  async remove(
    @Query('id') id: string
  ) {
    return await this.teamsService.remove(id);
  }

  @Get(':id/prefs')
  async getPrefs(
    @Query('id') id: string
  ) {
    return await this.teamsService.getPrefs(id);
  }

  @Put(':id/prefs')
  async setPrefs(
    @Query('id') id: string,
    @Body() input: UpdateTeamPrefsDto
  ) {
    return await this.teamsService.setPrefs(id, input);
  }

  @Post(':id/memberships')
  @ResponseType({ type: Response.MODEL_MEMBERSHIP })
  async addMember(
    @Query('id') id: string,
    @Body() input: CreateMembershipDto
  ) {
    return await this.teamsService.addMember(id, input);
  }

  @Get(':id/memberships')
  @ResponseType({ type: Response.MODEL_MEMBERSHIP, list: true })
  async getMembers(
    @Query('id') id: string
  ) {
    return await this.teamsService.getMembers(id);
  }

  @Get(':id/memberships/:memberId')
  @ResponseType({ type: Response.MODEL_MEMBERSHIP })
  async getMember(
    @Query('id') id: string,
    @Query('memberId') memberId: string
  ) {
    return await this.teamsService.getMember(id, memberId);
  }

}
