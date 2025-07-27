import { Inject, Injectable } from '@nestjs/common';
import { CreateWaitlistDTO } from './DTO/waitlist.dto';
import { DB_FOR_PLATFORM, GEO_DB } from '@nuvix/utils/constants';
import { Database, Document, DuplicateException } from '@nuvix/database';
import { CountryResponse, Reader } from 'maxmind';
import { Exception } from '@nuvix/core/extend/exception';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_FOR_PLATFORM) private readonly db: Database,
    @Inject(GEO_DB) private readonly geoDb: Reader<CountryResponse>,
  ) {}

  async joinWaitlist(request: NuvixRequest, body: CreateWaitlistDTO) {
    const doc = new Document({
      ...body,
      createdAt: new Date(),
      metadata: {
        ...(body.metadata || {}),
        userAgent: request.headers['user-agent'] ?? null,
        ip: request.ip ?? null,
      },
    });

    try {
      await this.db.createDocument('waitlist', doc);
      return {
        message: "You've successfully joined the waitlist.",
      };
    } catch (e) {
      if (e instanceof DuplicateException) {
        throw new Exception(
          'DUPLICATE_WAITLIST_ENTRY',
          'This email is already on the waitlist.',
          409,
        );
      }
      throw new Exception(Exception.GENERAL_SERVER_ERROR);
    }
  }
}
