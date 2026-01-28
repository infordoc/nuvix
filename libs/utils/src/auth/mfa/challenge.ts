import { UsersDoc, type ChallengesDoc } from 'libs/utils/types'

export abstract class Challenge {
  public static async verify(user: UsersDoc, otp: string): Promise<boolean> {
    return false
  }
  public static async challenge(
    challenge: ChallengesDoc,
    user: UsersDoc,
    otp: string,
  ): Promise<boolean> {
    return false
  }
}
