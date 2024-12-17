import { Injectable, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/session/entities/session.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class AccountService {

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) { }

  async validateUser(username: string, password: string): Promise<User | null> {
    let user = await this.userRepository.findOne({ where: { username: username } });
    return user;
  }

  async login(@Req() req: Request, user: User) {
    const session = await this.createSession(req, user);
    return session;
  }

  async createSession(@Req() req: Request, user: User | null): Promise<Session | null> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const deviceInfo = JSON.stringify({
      platform: req.headers['sec-ch-ua-platform'],
      mobile: req.headers['sec-ch-ua-mobile'],
      browser: req.headers['sec-ch-ua']
    });
    try {
      let refreshToken = new ObjectId().toHexString();
      const session = new Session();
      session.ipAddress = ipAddress;
      session.userAgent = userAgent;
      session.deviceInfo = deviceInfo;
      session.user = user;
      session.isActive = true;
      session.refreshToken = refreshToken;
      session.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await this.sessionRepository.save(session);
      session.accessToken = this.jwtService.sign({ _sid: session._id });
      session.lastUsedAt = new Date();
      await this.sessionRepository.save(session);
      return session;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const session = await this.sessionRepository.findOne({ where: { refreshToken: refreshToken } });
    if (!session) {
      return null;
    }
    if (session.refreshTokenExpiresAt < new Date()) {
      return null;
    }
    session.accessToken = this.jwtService.sign({ _sid: session._id });
    session.lastUsedAt = new Date();
    await this.sessionRepository.save(session);
    return session;
  }
}
