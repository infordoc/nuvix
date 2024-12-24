
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type IdentitiesDocument = HydratedDocument<Identities>;
export type SessionDocument = HydratedDocument<Session>;

/**
 * Represents the schema for identity providers.
 * 
 * @schema Identities
 * @property {string} provider - The name of the identity provider (e.g., Google, Facebook).
 * @property {string} providerId - The unique identifier for the user from the identity provider.
 * @property {string} [accessToken] - The access token provided by the identity provider.
 * @property {string} [refreshToken] - The refresh token provided by the identity provider.
 * @property {number} [expiresIn] - The duration (in seconds) for which the access token is valid.
 * @property {string} [tokenType] - The type of the token provided by the identity provider.
 */
@Schema({ timestamps: true })
export class Identities {
  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  providerId: string;

  @Prop()
  accessToken: string;

  @Prop()
  refreshToken: string;

  @Prop()
  expiresIn: number;

  @Prop()
  tokenType: string;
}


/**
 * Represents a user session.
 */
@Schema({ timestamps: true })
export class Session {
  /**
   * The ID of the user associated with the session.
   * @type {string}
   * @memberof Session
   * @required
   */
  @Prop({ required: true })
  userId: string;

  /**
   * The user agent string of the device used in the session.
   * @type {string}
   * @memberof Session
   * @required
   */
  @Prop()
  userAgent: string;

  /**
   * The IP address from which the session was initiated.
   * @type {string}
   * @memberof Session
   * @required
   */
  @Prop()
  ipAddress: string;

  /**
   * The geographical location of the session.
   * @type {string}
   * @memberof Session
   */
  @Prop()
  location: string;

  /**
   * The type of device used in the session.
   * @type {string}
   * @memberof Session
   */
  @Prop()
  device: string;

  /**
   * The refresh token for the session.
   * @type {string}
   * @memberof Session
   * @required
   */
  @Prop({ required: true })
  refreshToken: string;

  /**
   * The expiration date of the refresh token.
   * @type {Date}
   * @memberof Session
   * @required
   */
  @Prop({ required: true })
  refreshTokenExpires: Date;

  /**
   * The access token for the session.
   * @type {string}
   * @memberof Session
   * @required
   */
  @Prop({ required: true })
  accessToken: string;

  /**
   * The expiration date of the access token.
   * @type {Date}
   * @memberof Session
   * @required
   */
  @Prop({ required: true })
  accessTokenExpires: Date;
}

export const IdentitiesSchema = SchemaFactory.createForClass(Identities);
export const SessionSchema = SchemaFactory.createForClass(Session);