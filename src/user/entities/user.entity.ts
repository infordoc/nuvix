import { Account, Authentication, SecuritySettings } from "src/account/entities/account.entity";
import { Session } from "src/session/entities/session.entity";
import BaseEntity from "src/Utils/base.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";


@Entity('users')
export class User extends BaseEntity {
  @Column('varchar', { length: 100 })
  firstName: string;

  @Column('varchar', { length: 50, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status: 'active' | 'inactive' | 'suspended';

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailedLoginAt: Date;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Account, account => account.user)
  accounts: Account[];

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];

  @OneToMany(() => Authentication, auth => auth.user)
  authentications: Authentication[];

  @OneToMany(() => SecuritySettings, settings => settings.user)
  securitySettings: SecuritySettings[];

  @OneToMany(() => UserRole, userRole => userRole.user)
  roles: UserRole[];

  @OneToMany(() => AuditLog, auditLog => auditLog.user)
  auditLogs: AuditLog[];
}


@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @OneToMany(() => Permission, permission => permission.role)
  permissions: Permission[];

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];
}

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  resource: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @ManyToOne(() => Role, role => role.permissions, { onDelete: 'CASCADE' })
  role: Role;
}


@Entity('user_roles')
export class UserRole extends BaseEntity {
  @ManyToOne(() => User, user => user.roles, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Role, role => role.userRoles, { onDelete: 'CASCADE' })
  role: Role;
}

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  action: string; // e.g., 'LOGIN', 'PASSWORD_CHANGE'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @ManyToOne(() => User, user => user.auditLogs, { onDelete: 'CASCADE' })
  user: User;
}
