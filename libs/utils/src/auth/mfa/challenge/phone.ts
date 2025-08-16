import { Challenge } from '../challenge';
import { MfaType } from '@nuvix/core/validators';
import { RecordDoc, UsersDoc } from '@nuvix/utils/types';

export class Phone extends Challenge {
  static override verify(challenge: UsersDoc, otp: string): boolean {
    return challenge.get('code') === otp;
  }

  static override challenge(challenge: RecordDoc<any>, user: UsersDoc, otp: string): boolean {
    if (
      challenge.has('type') &&
      challenge.get('type') === MfaType.PHONE
    ) {
      return this.verify(challenge as UsersDoc, otp);
    }
    return false;
  }
}
