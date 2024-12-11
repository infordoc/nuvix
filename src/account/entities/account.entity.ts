import { User } from 'src/user/entities/user.entity';
import BaseEntity from 'src/Utils/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity('accounts')
export class Account extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  platform: string;

  @Column({ type: 'varchar', length: 100 })
  accountId: string;

  @Column({ type: 'enum', enum: ['personal', 'business'], default: 'personal' })
  accountType: 'personal' | 'business';

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User, user => user.accounts, { onDelete: 'CASCADE' })
  user: User;
}

@Entity('authentications')
export class Authentication extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  loginMethod: string;

  @Column({ type: 'text', nullable: true })
  hashedPassword: string;

  @Column({ type: 'text', nullable: true })
  oauthToken: string;

  @Column({ type: 'timestamp', nullable: true })
  lastPasswordChangeAt: Date;

  @Column({ type: 'boolean', default: false })
  isMfaEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @ManyToOne(() => User, user => user.authentications, { onDelete: 'CASCADE' })
  user: User;
}

@Entity('security_settings')
export class SecuritySettings extends BaseEntity {
  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  backupCodes: string[];

  @Column({ type: 'json', nullable: true })
  trustedDevices: { deviceId: string; addedAt: Date }[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  securityQuestion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  securityAnswer: string;

  @ManyToOne(() => User, user => user.securitySettings, { onDelete: 'CASCADE' })
  user: User;
}
