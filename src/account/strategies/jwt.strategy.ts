
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_SECRET } from 'src/Utils/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/session/entities/session.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: { _sid: string } | any) {
    console.log(payload);
    let session = await this.sessionRepository.findOne({ where: { _id: payload._sid }, relations: ['user'] });
    console.log(session);
    if (session && session.isActive) {
      return session.user;
    } else {
      return null;
    }
  }
}
