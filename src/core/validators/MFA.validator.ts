import { OTP } from 'otplib';
import { Auth } from '../helper/auth.helper';
import { UserEntity } from '../entities/users/user.entity';


abstract class MfaType {
  protected instance: OTP;

  public static readonly TOTP = 'totp';
  public static readonly EMAIL = 'email';
  public static readonly PHONE = 'phone';
  public static readonly RECOVERY_CODE = 'recoveryCode';

  constructor(instance: OTP) {
    this.instance = instance;
  }

  public setLabel(label: string): this {
    this.instance.options.label = label;
    return this;
  }

  public getLabel(): string | null {
    return this.instance.options.label || null;
  }

  public setIssuer(issuer: string): this {
    this.instance.options.issuer = issuer;
    return this;
  }

  public getIssuer(): string | null {
    return this.instance.options.issuer || null;
  }

  public getSecret(): string {
    return this.instance.options.secret;
  }

  public getProvisioningUri(): string {
    return this.instance.toString();
  }

  public static generateBackupCodes(length: number = 10, total: number = 6): string[] {
    const backups: string[] = [];

    for (let i = 0; i < total; i++) {
      backups.push(Auth.tokenGenerator(length));
    }

    return backups;
  }
}


class TOTP extends MfaType {
  constructor(secret?: string) {
    const instance = OTP.create({ secret });
    super(instance);
  }

  public static getAuthenticatorFromUser(user: UserEntity): any | null {
    const authenticators = user.authenticators || [];
    for (const authenticator of authenticators) {
      if (authenticator.type === MfaType.TOTP) {
        return authenticator;
      }
    }
    return null;
  }
}

export { MfaType, TOTP };