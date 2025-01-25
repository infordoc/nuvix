import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
  CreateTeamDTO,
  UpdateTeamDTO,
  UpdateTeamPrefsDTO,
} from './dto/team.dto';
import { ID } from 'src/core/helper/ID.helper';
import { Exception } from 'src/core/extend/exception';
import { TOTP } from 'src/core/validators/MFA.validator';
import {
  CreateMembershipDTO,
  UpdateMembershipDTO,
  UpdateMembershipStatusDTO,
} from './dto/membership.dto';
import { DB_FOR_PROJECT } from 'src/Utils/constants';
import {
  Authorization,
  Database,
  Document,
  DuplicateException,
  Permission,
  Query,
  Role,
} from '@nuvix/database';
import { Auth } from 'src/core/helper/auth.helper';

@Injectable()
export class TeamsService {
  private logger: Logger = new Logger(TeamsService.name);

  constructor(
    @Inject(DB_FOR_PROJECT) private readonly db: Database,
    private readonly cls: ClsService,
  ) {}

  /**
   * Find all teams
   */
  async findAll(queries: Query[], search?: string) {
    if (search) {
      queries.push(Query.search('search', search));
    }

    // Get cursor document if there was a cursor query
    const cursor = queries.find((query) =>
      [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(
        query.getMethod(),
      ),
    );

    if (cursor) {
      const teamId = cursor.getValue();
      const cursorDocument = await this.db.getDocument('teams', teamId);

      if (!cursorDocument) {
        throw new Exception(
          Exception.GENERAL_CURSOR_NOT_FOUND,
          `Team '${teamId}' for the 'cursor' value not found.`,
        );
      }

      cursor.setValue(cursorDocument);
    }

    const filterQueries = Query.groupByType(queries)['filters'];
    const results = await this.db.find('teams', queries);
    const total = await this.db.count('teams', filterQueries);

    return {
      teams: results,
      total: total,
    };
  }

  /**
   * Create a new team
   */
  async create(user: Document | null, input: CreateTeamDTO) {
    const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());
    const isAppUser = Auth.isAppUser(Authorization.getRoles());

    const teamId = input.teamId == 'unique()' ? ID.unique() : input.teamId;

    const team = await this.db
      .createDocument(
        'teams',
        new Document({
          $id: teamId,
          $permissions: [
            Permission.read(Role.team(teamId)),
            Permission.update(Role.team(teamId, 'owner')),
            Permission.delete(Role.team(teamId, 'owner')),
          ],
          name: input.name,
          total: isPrivilegedUser || isAppUser ? 0 : 1,
          prefs: {},
          search: [teamId, input.name].join(' '),
        }),
      )
      .catch((error) => {
        if (error instanceof DuplicateException) {
          throw new Exception(Exception.TEAM_ALREADY_EXISTS);
        }
        throw error;
      });

    if (!isPrivilegedUser && !isAppUser && user) {
      // Don't add user on server mode
      if (!input.roles.includes('owner')) {
        input.roles.push('owner');
      }

      const membershipId = ID.unique();
      const membership = await this.db.createDocument(
        'memberships',
        new Document({
          $id: membershipId,
          $permissions: [
            Permission.read(Role.user(user.getId())),
            Permission.read(Role.team(team.getId())),
            Permission.update(Role.user(user.getId())),
            Permission.update(Role.team(team.getId(), 'owner')),
            Permission.delete(Role.user(user.getId())),
            Permission.delete(Role.team(team.getId(), 'owner')),
          ],
          userId: user.getId(),
          userInternalId: user.getInternalId(),
          teamId: team.getId(),
          teamInternalId: team.getInternalId(),
          roles: input.roles,
          invited: new Date(),
          joined: new Date(),
          confirm: true,
          secret: '',
          search: [membershipId, user.getId()].join(' '),
        }),
      );

      await this.db.purgeCachedDocument('users', user.getId());
    }

    return team;
  }

  /**
   * Update team
   */
  async update(id: string, input: UpdateTeamDTO) {
    const team = await this.db.getDocument('teams', id);

    if (team.isEmpty()) {
      throw new Exception(Exception.TEAM_NOT_FOUND);
    }

    team.setAttribute('name', input.name);
    team.setAttribute('search', [id, input.name].join(' '));

    const updatedTeam = await this.db.updateDocument(
      'teams',
      team.getId(),
      team,
    );

    return updatedTeam;
  }

  /**
   * Remove team
   */
  async remove(id: string) {
    const team = await this.db.getDocument('teams', id);

    if (team.isEmpty()) {
      throw new Exception(Exception.TEAM_NOT_FOUND);
    }

    const deleted = await this.db.deleteDocument('teams', id);
    if (!deleted) {
      throw new Exception(
        Exception.GENERAL_SERVER_ERROR,
        'Failed to remove team from DB',
      );
    }

    // Delete all memberships associated with this team
    const membershipQueries = [Query.equal('teamId', [team.getId()])];
    const memberships = await this.db.find('memberships', membershipQueries);
    for (const membership of memberships) {
      await this.db.deleteDocument('memberships', membership.getId());
    }

    // Additional processing like queueing events could go here
    return null;
  }

  /**
   * Find a team by id
   */
  async findOne(id: string) {
    const team = await this.db.getDocument('teams', id);

    if (!team) {
      throw new Exception(Exception.TEAM_NOT_FOUND);
    }

    return team;
  }

  /**
   * Get team preferences
   */
  async getPrefs(id: string) {
    const team = await this.db.getDocument('teams', id);

    if (!team) {
      throw new Exception(Exception.TEAM_NOT_FOUND);
    }

    return team.getAttribute('prefs', {});
  }

  /**
   * Set team preferences
   */
  async setPrefs(id: string, input: UpdateTeamPrefsDTO) {
    const team = await this.db.getDocument('teams', id);

    if (team.isEmpty()) {
      throw new Exception(Exception.TEAM_NOT_FOUND);
    }

    team.setAttribute('prefs', input.prefs);
    const updatedTeam = await this.db.updateDocument(
      'teams',
      team.getId(),
      team,
    );

    return updatedTeam.getAttribute('prefs');
  }

  /**
   * Add a member to the team
   */
  // async addMember(id: string, input: CreateMembershipDTO) {
  //   const team = await this.teamRepo.findOneBy({ $id: id });
  //   if (!team) {
  //     throw new Exception(Exception.TEAM_NOT_FOUND);
  //   }

  //   let invitee: UserEntity | null = null;

  //   if (input.userId) {
  //     invitee = await this.userRepo.findOneBy({ $id: input.userId });
  //     if (!invitee) {
  //       throw new Exception(Exception.USER_NOT_FOUND);
  //     }
  //     if (input.email && invitee.email !== input.email) {
  //       throw new Exception(
  //         Exception.USER_ALREADY_EXISTS,
  //         "Given userId and email don't match",
  //         409,
  //       );
  //     }
  //     if (input.phone && invitee.phone !== input.phone) {
  //       throw new Exception(
  //         Exception.USER_ALREADY_EXISTS,
  //         "Given userId and phone don't match",
  //         409,
  //       );
  //     }
  //   } else if (input.email) {
  //     invitee = await this.userRepo.findOneBy({ email: input.email });
  //     if (invitee && input.phone && invitee.phone !== input.phone) {
  //       throw new Exception(
  //         Exception.USER_ALREADY_EXISTS,
  //         "Given email and phone don't match",
  //         409,
  //       );
  //     }
  //   } else if (input.phone) {
  //     invitee = await this.userRepo.findOneBy({ phone: input.phone });
  //     if (invitee && input.email && invitee.email !== input.email) {
  //       throw new Exception(
  //         Exception.USER_ALREADY_EXISTS,
  //         "Given phone and email don't match",
  //         409,
  //       );
  //     }
  //   }

  //   if (!invitee) {
  //     invitee = this.userRepo.create({
  //       $id: ID.unique(),
  //       email: input.email,
  //       phone: input.phone,
  //       name: input.email,
  //       prefs: {},
  //       labels: [],
  //       search: [input.email, input.phone].join(' '),
  //     });
  //     await this.userRepo.save(invitee);
  //   }

  //   const membershipId = ID.unique();
  //   const membership = this.membershipsRepo.create({
  //     $id: membershipId,
  //     $permissions: [
  //       Permission.Read(Role.User(invitee.$id)),
  //       Permission.Read(Role.Team(team.$id)),
  //       Permission.Update(Role.User(invitee.$id)),
  //       Permission.Update(Role.Team(team.$id, 'owner')),
  //       Permission.Delete(Role.User(invitee.$id)),
  //       Permission.Delete(Role.Team(team.$id, 'owner')),
  //     ],
  //     userId: invitee.$id,
  //     user: invitee,
  //     teamId: team.$id,
  //     team: team,
  //     roles: input.roles,
  //     invited: new Date(),
  //     joined: new Date(),
  //     confirm: true,
  //     secret: '',
  //     search: [membershipId, invitee.$id].join(' '),
  //   });

  //   await this.membershipsRepo.save(membership);

  //   team.total += 1;
  //   await this.teamRepo.save(team);
  //   // Send invitation email or SMS
  //   // ...

  //   return membership;
  // }

  // /**
  //  * Get all members of the team
  //  */
  // async getMembers(id: string) {
  //   const team = await this.teamRepo.findOneBy({ $id: id });
  //   if (!team) {
  //     throw new Exception(Exception.TEAM_NOT_FOUND);
  //   }

  //   const memberships = await this.membershipsRepo.findAndCount({
  //     where: { teamId: team.$id },
  //   });

  //   for (const membership of memberships[0]) {
  //     const user = await this.userRepo.findOne({
  //       where: { $id: membership.userId },
  //       relations: { authenticators: true },
  //     });

  //     let mfa = user.mfa || false;
  //     if (mfa) {
  //       const totp = TOTP.getAuthenticatorFromUser(user);
  //       const totpEnabled = totp && totp.verified;
  //       const emailEnabled = user.email && user.emailVerification;
  //       const phoneEnabled = user.phone && user.phoneVerification;

  //       if (!totpEnabled && !emailEnabled && !phoneEnabled) {
  //         mfa = false;
  //       }
  //     }

  //     membership.mfa = mfa;
  //     membership.teamName = team.name;
  //     membership.userName = user.name;
  //     membership.userEmail = user.email;
  //   }

  //   return {
  //     total: memberships[1],
  //     memberships: memberships[0],
  //   };
  // }

  // /**
  //  * Get A member of the team
  //  */
  // async getMember(teamId: string, memberId: string) {
  //   const team = await this.teamRepo.findOneBy({ $id: teamId });
  //   if (!team) {
  //     throw new Exception(Exception.TEAM_NOT_FOUND);
  //   }

  //   const membership = await this.membershipsRepo.findOneBy({
  //     teamId: team.$id,
  //     $id: memberId,
  //   });
  //   if (!membership) {
  //     throw new Exception(Exception.MEMBERSHIP_NOT_FOUND);
  //   }

  //   const user = await this.userRepo.findOne({
  //     where: { $id: membership.userId },
  //     relations: { authenticators: true },
  //   });

  //   let mfa = user.mfa || false;
  //   if (mfa) {
  //     const totp = TOTP.getAuthenticatorFromUser(user);
  //     const totpEnabled = totp && totp.verified;
  //     const emailEnabled = user.email && user.emailVerification;
  //     const phoneEnabled = user.phone && user.phoneVerification;

  //     if (!totpEnabled && !emailEnabled && !phoneEnabled) {
  //       mfa = false;
  //     }
  //   }

  //   membership.mfa = mfa;
  //   membership.teamName = team.name;
  //   membership.userName = user.name;
  //   membership.userEmail = user.email;

  //   return membership;
  // }

  // /**
  //  * Update member of the team
  //  */
  // async updateMember(
  //   teamId: string,
  //   memberId: string,
  //   input: UpdateMembershipDTO,
  // ) {
  //   const team = await this.teamRepo.findOneBy({ $id: teamId });
  //   if (!team) {
  //     throw new Exception(Exception.TEAM_NOT_FOUND);
  //   }

  //   const membership = await this.membershipsRepo.findOne({
  //     where: { teamId: team.$id, $id: memberId },
  //     relations: { user: true },
  //   });
  //   if (!membership) {
  //     throw new Exception(Exception.MEMBERSHIP_NOT_FOUND);
  //   }

  //   if (input.roles) {
  //     membership.roles = input.roles;
  //   }

  //   await this.membershipsRepo.save(membership);

  //   membership.teamName = team.name;
  //   membership.userName = membership.user.name;
  //   membership.userEmail = membership.user.email;

  //   return membership;
  // }

  // /**
  //  * Update Membership Status
  //  */
  // async updateMemberStatus(
  //   teamId: string,
  //   memberId: string,
  //   input: UpdateMembershipStatusDTO,
  // ) {
  //   /**@todo ---- */
  //   throw new Exception(Exception.GENERAL_NOT_IMPLEMENTED);
  // }

  // /**
  //  * Delete member of the team
  //  */
  // async deleteMember(teamId: string, memberId: string) {
  //   const team = await this.teamRepo.findOneBy({ $id: teamId });
  //   if (!team) {
  //     throw new Exception(Exception.TEAM_NOT_FOUND);
  //   }

  //   const membership = await this.membershipsRepo.findOneBy({
  //     teamId: team.$id,
  //     $id: memberId,
  //   });
  //   if (!membership) {
  //     throw new Exception(Exception.MEMBERSHIP_NOT_FOUND);
  //   }

  //   await this.membershipsRepo.remove(membership);

  //   team.total -= 1;
  //   await this.teamRepo.save(team);

  //   return null;
  // }
}
