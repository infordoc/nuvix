import { Challenge } from '../challenge'
import { MfaType } from '@nuvix/core/validators'
import { UsersDoc, type ChallengesDoc } from '@nuvix/utils/types'

export class Phone extends Challenge {
  static override async verify(
    challenge: UsersDoc,
    otp: string,
  ): Promise<boolean> {
    return challenge.get('code') === otp
  }

  static override async challenge(
    challenge: ChallengesDoc,
    user: UsersDoc,
    otp: string,
  ): Promise<boolean> {
    if (challenge.has('type') && challenge.get('type') === MfaType.PHONE) {
      return this.verify(challenge as UsersDoc, otp)
    }
    return false
  }
}
