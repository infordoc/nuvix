import { Injectable } from '@nestjs/common'
import { ID } from '@nuvix/core/helper/ID.helper'
import { Exception } from '@nuvix/core/extend/exception'
import { TOTP } from '@nuvix/core/validators/MFA.validator'
import {
  CreateMembershipDTO,
  UpdateMembershipDTO,
  UpdateMembershipStatusDTO,
} from './DTO/membership.dto'
import { SessionProvider } from '@nuvix/utils'
import {
  Authorization,
  AuthorizationException,
  Database,
  Doc,
  Permission,
  Query,
  Role,
} from '@nuvix/db'
import { Auth } from '@nuvix/core/helper/auth.helper'
import { CoreService } from '@nuvix/core'
import type { Memberships, UsersDoc } from '@nuvix/utils/types'
import { Detector } from '@nuvix/core/helper'

@Injectable()
export class MembershipsService {
  private readonly db: Database
  constructor(private readonly coreService: CoreService) {
    this.db = this.coreService.getPlatformDb()
  }

  /**
   * Add a member to the team
   */
  async addMember(id: string, input: CreateMembershipDTO) {
    throw new Exception(Exception.GENERAL_NOT_IMPLEMENTED)
    // if (!input.userId && !input.email && !input.phone) {
    //   throw new Exception(
    //     Exception.GENERAL_ARGUMENT_INVALID,
    //     'At least one of userId, email, or phone is required',
    //   )
    // }

    // const team = await this.db.getDocument('teams', id)
    // if (team.empty()) {
    //   throw new Exception(Exception.TEAM_NOT_FOUND)
    // }

    // let invitee: UsersDoc | null = null

    // if (input.userId) {
    //   invitee = await this.db.getDocument('users', input.userId)
    //   if (invitee.empty()) {
    //     throw new Exception(Exception.USER_NOT_FOUND)
    //   }
    //   if (input.email && invitee.get('email') !== input.email) {
    //     throw new Exception(
    //       Exception.USER_ALREADY_EXISTS,
    //       'Given userId and email do not match',
    //       409,
    //     )
    //   }
    //   if (input.phone && invitee.get('phone') !== input.phone) {
    //     throw new Exception(
    //       Exception.USER_ALREADY_EXISTS,
    //       'Given userId and phone do not match',
    //       409,
    //     )
    //   }
    // } else if (input.email) {
    //   invitee = await this.db.findOne('users', [
    //     Query.equal('email', [input.email]),
    //   ])
    //   if (
    //     !invitee.empty() &&
    //     input.phone &&
    //     invitee.get('phone') !== input.phone
    //   ) {
    //     throw new Exception(
    //       Exception.USER_ALREADY_EXISTS,
    //       'Given email and phone do not match',
    //       409,
    //     )
    //   }
    // } else if (input.phone) {
    //   invitee = await this.db.findOne('users', [
    //     Query.equal('phone', [input.phone]),
    //   ])
    //   if (
    //     !invitee.empty() &&
    //     input.email &&
    //     invitee.get('email') !== input.email
    //   ) {
    //     throw new Exception(
    //       Exception.USER_ALREADY_EXISTS,
    //       'Given phone and email do not match',
    //       409,
    //     )
    //   }
    // }

    // if (!invitee || invitee.empty()) {
    //   const userId = ID.unique()
    //   invitee = await this.db.createDocument(
    //     'users',
    //     new Doc({
    //       $id: userId,
    //       $permissions: [
    //         Permission.read(Role.any()),
    //         Permission.read(Role.user(userId)),
    //         Permission.update(Role.user(userId)),
    //         Permission.delete(Role.user(userId)),
    //       ],
    //       email: input.email,
    //       phone: input.phone,
    //       emailVerification: false,
    //       name: input.name || input.email,
    //       prefs: {},
    //       search: [userId, input.email, input.phone, input.name]
    //         .filter(Boolean)
    //         .join(' '),
    //     }),
    //   )
    // }

    // const membershipId = ID.unique()
    // const secret = Auth.tokenGenerator(128)

    // const membership = await this.db.createDocument(
    //   'memberships',
    //   new Doc({
    //     $id: membershipId,
    //     $permissions: [
    //       Permission.read(Role.any()),
    //       Permission.update(Role.user(invitee.getId())),
    //       Permission.update(Role.team(team.getId(), 'owner')),
    //       Permission.delete(Role.user(invitee.getId())),
    //       Permission.delete(Role.team(team.getId(), 'owner')),
    //     ],
    //     userId: invitee.getId(),
    //     userInternalId: invitee.getSequence(),
    //     teamId: team.getId(),
    //     teamInternalId: team.getSequence(),
    //     roles: input.roles,
    //     invited: new Date(),
    //     confirm: false,
    //     secret: Auth.hash(secret),
    //     search: [membershipId, invitee.getId()].join(' '),
    //   }),
    // )

    // membership
    //   .set('teamName', team.get('name'))
    //   .set('userName', invitee.get('name'))
    //   .set('userEmail', invitee.get('email'))

    // return membership
  }

  /**
   * Get all members of the team
   */
  async getMembers(id: string, queries: Query[], search?: string) {
    const team = await this.db.getDocument('teams', id)
    if (team.empty()) {
      throw new Exception(Exception.TEAM_NOT_FOUND)
    }

    if (search) {
      queries.push(Query.search('search', search))
    }
    queries.push(Query.equal('teamInternalId', [team.getSequence()]))

    const filterQueries = Query.groupByType(queries)['filters']
    const memberships = await this.db.find('memberships', queries)
    const total = await this.db.count('memberships', filterQueries)

    const validMemberships = memberships
      .filter(membership => membership.get('userId'))
      .map(async membership => {
        const user = await this.db.getDocument(
          'users',
          membership.get('userId'),
        )

        let mfa = user.get('mfa', false)
        if (mfa) {
          const totp = TOTP.getAuthenticatorFromUser(user)
          const totpEnabled = totp && totp.get('verified', false)
          const emailEnabled =
            user.get('email') && user.get('emailVerification')
          const phoneEnabled =
            user.get('phone') && user.get('phoneVerification')

          if (!totpEnabled && !emailEnabled && !phoneEnabled) {
            mfa = false
          }
        }

        membership
          .set('mfa', mfa)
          .set('teamName', team.get('name'))
          .set('userName', user.get('name'))
          .set('userEmail', user.get('email'))

        return membership
      })

    return {
      data: await Promise.all(validMemberships),
      total: total,
    }
  }

  /**
   * Get A member of the team
   */
  async getMember(teamId: string, memberId: string) {
    const team = await this.db.getDocument('teams', teamId)
    if (team.empty()) {
      throw new Exception(Exception.TEAM_NOT_FOUND)
    }

    const membership = await this.db.getDocument('memberships', memberId)
    if (membership.empty() || !membership.get('userId')) {
      throw new Exception(Exception.MEMBERSHIP_NOT_FOUND)
    }

    const user = await this.db.getDocument('users', membership.get('userId'))

    let mfa = user.get('mfa', false)
    if (mfa) {
      const totp = TOTP.getAuthenticatorFromUser(user)
      const totpEnabled = totp && totp.get('verified', false)
      const emailEnabled = user.get('email') && user.get('emailVerification')
      const phoneEnabled = user.get('phone') && user.get('phoneVerification')

      if (!totpEnabled && !emailEnabled && !phoneEnabled) {
        mfa = false
      }
    }

    membership
      .set('mfa', mfa)
      .set('teamName', team.get('name'))
      .set('userName', user.get('name'))
      .set('userEmail', user.get('email'))

    return membership
  }

  /**
   * Update member of the team
   */
  async updateMember(
    teamId: string,
    memberId: string,
    input: UpdateMembershipDTO,
  ) {
    const team = await this.db.getDocument('teams', teamId)
    if (team.empty()) {
      throw new Exception(Exception.TEAM_NOT_FOUND)
    }

    const membership = await this.db.getDocument('memberships', memberId)
    if (membership.empty()) {
      throw new Exception(Exception.MEMBERSHIP_NOT_FOUND)
    }

    const user = await this.db.getDocument('users', membership.get('userId'))
    if (user.empty()) {
      throw new Exception(Exception.USER_NOT_FOUND)
    }

    const isOwner = Authorization.isRole(`team:${team.getId()}/owner`)

    if (!isOwner) {
      throw new Exception(
        Exception.USER_UNAUTHORIZED,
        'User is not allowed to modify roles',
      )
    }

    membership.set('roles', input.roles)
    const updatedMembership = await this.db.updateDocument(
      'memberships',
      membership.getId(),
      membership,
    )

    await this.db.purgeCachedDocument('users', user.getId())

    updatedMembership
      .set('teamName', team.get('name'))
      .set('userName', user.get('name'))
      .set('userEmail', user.get('email'))

    return updatedMembership
  }

  /**
   * Update Membership Status
   */
  async updateMemberStatus(
    teamId: string,
    memberId: string,
    { userId, secret }: UpdateMembershipStatusDTO,
    request: NuvixRequest,
    response: NuvixRes,
    user: UsersDoc,
  ): Promise<Doc<Memberships>> {
    const protocol = request.protocol
    const membership = await this.db.getDocument('memberships', memberId)

    if (membership.empty()) {
      throw new Exception(Exception.MEMBERSHIP_NOT_FOUND)
    }

    const team = await Authorization.skip(() =>
      this.db.getDocument('teams', teamId),
    )

    if (team.empty()) {
      throw new Exception(Exception.TEAM_NOT_FOUND)
    }

    if (membership.get('teamInternalId') !== team.getSequence()) {
      throw new Exception(Exception.TEAM_MEMBERSHIP_MISMATCH)
    }

    if (Auth.hash(secret) !== membership.get('secret')) {
      throw new Exception(Exception.TEAM_INVALID_SECRET)
    }

    if (userId !== membership.get('userId')) {
      throw new Exception(
        Exception.TEAM_INVITE_MISMATCH,
        `Invite does not belong to current user (${user.get('email')})`,
      )
    }

    const hasSession = !user.empty()
    if (!hasSession) {
      const userData = await this.db.getDocument('users', userId)
      user.setAll(userData.toObject())
    }

    if (membership.get('userInternalId') !== user.getSequence()) {
      throw new Exception(
        Exception.TEAM_INVITE_MISMATCH,
        `Invite does not belong to current user (${user.get('email')})`,
      )
    }

    if (membership.get('confirm') === true) {
      throw new Exception(Exception.MEMBERSHIP_ALREADY_CONFIRMED)
    }

    membership.set('joined', new Date()).set('confirm', true)

    await Authorization.skip(() =>
      this.db.updateDocument(
        'users',
        user.getId(),
        user.set('emailVerification', true),
      ),
    )

    // Create session for the user if not logged in
    if (!hasSession) {
      Authorization.setRole(Role.user(user.getId()).toString())

      const detector = new Detector(request.headers['user-agent'] ?? 'UNKNWON')
      const record = this.coreService.getGeoDb().get(request.ip)
      const authDuration =
        this.coreService.getPlatform().get('auths', {})['duration'] ??
        Auth.TOKEN_EXPIRATION_LOGIN_LONG
      const expire = new Date(Date.now() + authDuration * 1000)
      const sessionSecret = Auth.tokenGenerator()

      const sessionDoc = new Doc({
        $id: ID.unique(),
        $permissions: [
          Permission.read(Role.user(user.getId())),
          Permission.update(Role.user(user.getId())),
          Permission.delete(Role.user(user.getId())),
        ],
        userId: user.getId(),
        userInternalId: user.getSequence(),
        provider: SessionProvider.EMAIL,
        providerUid: user.get('email'),
        secret: Auth.hash(sessionSecret),
        userAgent: request.headers['user-agent'] || 'UNKNWON',
        ip: request.ip,
        factors: ['email'],
        countryCode: record ? record.country?.iso_code?.toLowerCase() : '--',
        expire: expire,
        ...detector.getClient(),
        ...detector.getOS(),
        ...detector.getDevice(),
      })

      await this.db.createDocument('sessions', sessionDoc)
      Authorization.setRole(Role.user(userId).toString())

      const domainVerification = request.domainVerification
      if (!domainVerification) {
        response.header(
          'X-Fallback-Cookies',
          JSON.stringify({
            [Auth.cookieName]: Auth.encodeSession(user.getId(), sessionSecret),
          }),
        )
      }

      const cookieDomain = Auth.cookieDomain
      const cookieSamesite = Auth.cookieSamesite

      response.setCookie(
        Auth.cookieName,
        Auth.encodeSession(user.getId(), sessionSecret),
        {
          expires: new Date(Math.floor(expire.getTime() / 1000)),
          path: '/',
          domain: cookieDomain,
          secure: protocol === 'https',
          httpOnly: true,
          sameSite: cookieSamesite,
        },
      )
    }

    const updatedMembership = await this.db.updateDocument(
      'memberships',
      membership.getId(),
      membership,
    )

    await this.db.purgeCachedDocument('users', user.getId())

    await Authorization.skip(() =>
      this.db.increaseDocumentAttribute('teams', team.getId(), 'total', 1),
    )

    return updatedMembership
      .set('teamName', team.get('name'))
      .set('userName', user.get('name'))
      .set('userEmail', user.get('email')) as Doc<Memberships>
  }

  /**
   * Delete member of the team
   */
  async deleteMember(teamId: string, memberId: string) {
    const team = await this.db.getDocument('teams', teamId)
    if (team.empty()) {
      throw new Exception(Exception.TEAM_NOT_FOUND)
    }

    const membership = await this.db.getDocument('memberships', memberId)
    if (membership.empty()) {
      throw new Exception(Exception.MEMBERSHIP_NOT_FOUND)
    }

    const user = await this.db.getDocument('users', membership.get('userId'))
    if (user.empty()) {
      throw new Exception(Exception.USER_NOT_FOUND)
    }

    if (membership.get('teamInternalId') !== team.getSequence()) {
      throw new Exception(Exception.TEAM_MEMBERSHIP_MISMATCH)
    }

    if (team.get('total', 0) === 1) {
      throw new Exception(
        Exception.DELETE_FAILED,
        'Organization must have at least one member',
      )
    }

    try {
      await this.db.deleteDocument('memberships', membership.getId())
    } catch (error) {
      if (error instanceof AuthorizationException) {
        throw new Exception(Exception.USER_UNAUTHORIZED)
      }
      throw new Exception(
        Exception.GENERAL_SERVER_ERROR,
        'Failed to remove membership from DB',
      )
    }

    await this.db.purgeCachedDocument('users', user.getId())

    if (membership.get('confirm')) {
      await this.db.decreaseDocumentAttribute(
        'teams',
        team.getId(),
        'total',
        1,
        0,
      )
    }
  }
}
