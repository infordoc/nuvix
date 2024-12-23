
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
export type IdentitiesDocument = HydratedDocument<Identities>;
export type SessionDocument = HydratedDocument<Session>;
export type OrganizationDocument = HydratedDocument<Organization>;
export type ProjectDocument = HydratedDocument<Project>;
export type DatabaseDocument = HydratedDocument<Database>;

/**
 * Represents a User in the system.
 */
@Schema()
export class User {
  /**
   * The email address of the user.
   * @type {string}
   * @memberof User
   * @required
   */
  @Prop({ required: true })
  email: string;

  /**
   * The password of the user.
   * @type {string}
   * @memberof User
   * @required
   */
  @Prop({ required: true })
  password: string;

  /**
   * The name of the user.
   * @type {string}
   * @memberof User
   * @required
   */
  @Prop({ required: true })
  name: string;

  /**
   * The identities associated with the user.
   * @type {Identities[]}
   * @memberof User
   */
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Identities' }] })
  identities: Identities[];

  /**
   * Indicates whether multi-factor authentication (MFA) is enabled for the user.
   * @type {boolean}
   * @memberof User
   * @default false
   */
  @Prop({ default: false })
  mfa: boolean;

  /**
   * Indicates whether the user's email is verified.
   * @type {boolean}
   * @memberof User
   * @default false
   */
  @Prop({ default: false })
  emailVerified: boolean;

  /**
   * The sessions associated with the user.
   * @type {Session[]}
   * @memberof User
   */
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }] })
  sessions: Session[];
}

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

/**
 * Represents an organization with a unique identifier, name, and associated users.
 */
export class Organization {
  @Prop({ required: true })
  $id: string

  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  users: User[];
}

/**
 * Represents a project with its details.
 */
@Schema({ timestamps: true })
export class Project {
  /**
   * Unique identifier for the project.
   * @type {string}
   */
  @Prop({ required: true })
  $id: string;

  /**
   * Name of the project.
   * @type {string}
   */
  @Prop({ required: true })
  name: string;

  /**
   * Identifier for the organization to which the project belongs.
   * @type {string}
   */
  @Prop({ required: true })
  orgnizationId: string;

  /**
   * List of services associated with the project.
   * Each service has a name and a status.
   * @type {Record<string, any>[]}
   */
  @Prop({
    type: [{
      name: String,
      status: String
    }], default: []
  })
  services: Record<string, any>[];
}

/**
 * Represents a database schema with necessary properties.
 * 
 * @schema Database
 * @property {string} $id - The unique identifier for the database.
 * @property {string} $internalId - The internal identifier for the database.
 * @property {string} name - The name of the database.
 * @property {string} projectId - The identifier of the project associated with the database.
 * @timestamps true - Indicates that timestamps are enabled for this schema.
 */
@Schema({ timestamps: true })
export class Database {
  @Prop({ required: true })
  $id: string;

  @Prop({ required: true })
  $internalId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  projectId: string
}

/**
 * Represents the attributes of a collection in the schema.
 * 
 * @schema
 * @id CollectionAttribute
 * 
 * @property {string} $id - The unique identifier for the collection attribute. This field is required.
 * @property {string} type - The type of the collection attribute. This field is required.
 * @property {string} format - The format of the collection attribute. This field is required.
 * @property {number} size - The size of the collection attribute. This field is required.
 * @property {boolean} signed - Indicates whether the collection attribute is signed. This field is required.
 * @property {boolean} required - Indicates whether the collection attribute is required. This field is required.
 * @property {string | null} [default=null] - The default value of the collection attribute. Defaults to null.
 * @property {boolean} array - Indicates whether the collection attribute is an array. This field is required.
 * @property {string[]} [filters=[]] - An array of filters applied to the collection attribute. Defaults to an empty array.
 */
@Schema({ _id: false })
export class CollectionAttribute {
  @Prop({ required: true })
  $id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  signed: boolean;

  @Prop({ required: true })
  required: boolean;

  @Prop({ default: null })
  default: string | null;

  @Prop({ required: true })
  array: boolean;

  @Prop({ type: [String], default: [] })
  filters: string[];
}


/**
 * Represents the schema for collection indexes.
 * 
 * @schema CollectionIndexes
 * @property {string} $id - The unique identifier for the collection index.
 * @property {string} type - The type of the collection index.
 * @property {string[]} attributes - The attributes associated with the collection index.
 * @property {number[]} lengths - The lengths of the attributes.
 * @property {string[]} orders - The order of the attributes.
 */
@Schema({ _id: false })
export class CollectionIndexes {
  @Prop({ required: true })
  $id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: [String], required: true })
  attributes: string[];

  @Prop({ type: [Number], required: true })
  lengths: number[];

  @Prop({ type: [String], required: true })
  orders: string[];
}


export const CollectionAttributeSchema = SchemaFactory.createForClass(CollectionAttribute);
export const CollectionIndexesSchema = SchemaFactory.createForClass(CollectionIndexes);

/**
 * Represents a collection schema for the database.
 * 
 * @schema Collection
 * @decorator `@Schema({ timestamps: true })`
 */
export class Collection {
  /**
   * The unique identifier for the collection.
   * 
   * @prop
   * @required
   */
  @Prop({ required: true })
  $id: string;

  /**
   * The name of the collection.
   * 
   * @prop
   * @required
   */
  @Prop({ required: true })
  name: string;

  /**
   * The identifier of the database to which the collection belongs.
   * 
   * @prop
   * @required
   */
  @Prop({ required: true })
  databaseId: string;

  /**
   * Indicates whether the collection is active.
   * 
   * @prop
   * @required
   * @default true
   */
  @Prop({ required: true, default: true })
  isActive: boolean;

  /**
   * Indicates whether the documents in the collection are secured.
   * 
   * @prop
   * @required
   * @default false
   */
  @Prop({ required: true, default: false })
  documentSecured: boolean;

  /**
   * The attributes of the collection.
   * 
   * @prop
   * @type {CollectionAttribute[]}
   */
  @Prop({ type: [CollectionAttributeSchema] })
  attributes: CollectionAttribute[];

  /**
   * The indexes of the collection.
   * 
   * @prop
   * @type {CollectionIndexes[]}
   */
  @Prop({ type: [CollectionIndexesSchema] })
  indexes: CollectionIndexes[];
}


export const UserSchema = SchemaFactory.createForClass(User);
export const IdentitiesSchema = SchemaFactory.createForClass(Identities);
export const SessionSchema = SchemaFactory.createForClass(Session);
export const OrganizationSchema = SchemaFactory.createForClass(Organization);
export const ProjectSchema = SchemaFactory.createForClass(Project);
export const DatabaseSchema = SchemaFactory.createForClass(Database);
export const CollectionSchema = SchemaFactory.createForClass(Collection);

type CollectionDocumentOverride = {
  attributes: Types.DocumentArray<CollectionAttribute>;
  indexes: Types.DocumentArray<CollectionIndexes>;
};

export type CollectionDocument = HydratedDocument<Collection, CollectionDocumentOverride>;