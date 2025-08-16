import { RecordDoc, UsersDoc } from 'libs/utils/types';

export abstract class Challenge {
  public static verify(user: UsersDoc, otp: string): boolean {
    return false;
  }
  public static challenge(
    challenge: RecordDoc,
    user: UsersDoc,
    otp: string,
  ): boolean {
    return false;
  }
}
