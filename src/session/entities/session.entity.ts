import { User } from 'src/user/entities/user.entity';
import BaseEntity from 'src/Utils/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity('sessions')
export class Session extends BaseEntity {
  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE', nullable: true })
  user: User;

  @Column({ type: 'varchar', length: 255, unique: true })
  accessToken: string; // Short-lived token for immediate authentication

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  refreshToken: string; // Long-lived token for renewing authentication

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt: Date; // Expiration date for the refresh token

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string; // IP address of the client for tracking

  @Column({ type: 'text', nullable: true })
  deviceInfo: string; // Device information of the client for tracking

  @Column({ type: 'text', nullable: true })
  geolocation: string; // Geolocation of the client for tracking

  @Column({ type: 'text', nullable: true })
  userAgent: string; // Client's user agent (e.g., browser, device type)

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Marks if the session is active (for logout/revocation)

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date; // Tracks the last usage for activity monitoring

  isAnonyams() {
    return !this.user;
  }
}
