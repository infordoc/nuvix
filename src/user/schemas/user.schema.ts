import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  Identities,
  Session,
  SessionDocument,
} from 'src/account/schemas/account.schema';
import { BaseSchema } from 'src/base/schemas/base.schema';

export type UserDocument = HydratedDocument<User>;
export type OrganizationDocument = HydratedDocument<Organization>;
export type TargetDocument = HydratedDocument<Target>;

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
}

/**
 * Represents a User in the system.
 */
@Schema({ timestamps: { createdAt: "$createdAt" }, versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true }, virtuals: true })
export class User extends BaseSchema {

  @Prop({ type: String, unique: true, index: true, required: true })
  id: string;

  @Prop({ required: true, unique: true, index: true, type: String })
  email: string;

  @Prop({ type: String, maxlength: 16, match: /^\+\d{1,15}$/ })
  phone: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Identities' }] })
  identities: Identities[];

  @Prop({ default: false, type: Boolean })
  mfa: boolean;

  @Prop({ default: false, type: Boolean })
  emailVerification: boolean;

  @Prop({ default: false, type: Boolean })
  phoneVerification: boolean;

  @Prop({ type: Date, default: new Date() })
  registration: Date;

  @Prop({ type: Date })
  passwordUpdate: Date;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: [String], default: [] })
  labels: string[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }] })
  sessions: Session[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Target' }] })
  targets: Target[];

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  prefs: { [key: string]: any };

  @Virtual({
    get(this: any) {
      return this.deletedAt !== null && this.deletedAt !== undefined;
    },
    set(this: any, deleted: Boolean) {
      this.deletedAt = deleted ? new Date() : null;
    }
  })
  $deleted: Boolean;

  @Virtual({
    get(this: any) {
      return this.id;
    },
    set(this: any, id: string) {
      this.id = id;
    }
  })
  $id: string;

  @Virtual({
    get(this: any) {
      return this.updatedAt;
    }
  })
  $updatedAt: Date;

  session: SessionDocument;
}


@Schema({ timestamps: { createdAt: "$createdAt" }, versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true }, virtuals: true })
export class Target extends BaseSchema {
  @Prop({ type: String, required: true, index: true, unique: true })
  id: string;

  @Prop({ type: String, default: "" })
  name: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: mongoose.Types.ObjectId, required: true })
  userInternalId: mongoose.Types.ObjectId;

  @Prop({ type: String })
  providerId: string | null;

  @Prop({ type: String, required: true })
  providerType: string;

  @Prop({ type: String, required: true })
  identifier: string;

  @Prop({ type: Boolean, required: true, default: false })
  expired: boolean;

  @Virtual({
    get(this: any) {
      return this.id;
    },
    set(this: any, id: string) {
      this.id = id;
    }
  })
  $id: string;

  @Virtual({
    get(this: any) {
      return this.deletedAt !== null && this.deletedAt !== undefined;
    },
    set(this: any, deleted: Boolean) {
      this.deletedAt = deleted ? new Date() : null;
    }
  })
  $deleted: Boolean;

  @Virtual({
    get(this: any) {
      return this.updatedAt;
    }
  })
  $updatedAt: Date;
}

/**
 * Represents an organization with a unique identifier, name, and associated users.
 */
@Schema({ timestamps: { createdAt: "$createdAt" }, versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true }, virtuals: true })
export class Organization extends BaseSchema {
  @Prop({ type: String, unique: true, index: true, required: true })
  id: string;

  @Prop({ required: true, type: String, index: true })
  userId: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: Number })
  total: number;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  prefs: { [key: string]: any };

  @Prop({ type: Number })
  billingBudget: number;

  @Prop({ type: [String] })
  budgetAlerts: string[];

  @Prop({ type: String })
  billingPlan: string;

  @Prop({ type: String })
  billingEmail: string;

  @Prop({ type: String })
  billingStartDate: string;

  @Prop({ type: String })
  billingCurrentInvoiceDate: string;

  @Prop({ type: String })
  billingNextInvoiceDate: string;

  @Prop({ type: String })
  billingTrialStartDate: string;

  @Prop({ type: Number })
  billingTrialDays: number;

  @Prop({ type: String })
  billingAggregationId: string;

  @Prop({ type: String })
  paymentMethodId: string;

  @Prop({ type: String })
  billingAddressId: string;

  @Prop({ type: String })
  backupPaymentMethodId: string;

  @Prop({ type: String })
  agreementBAA: string;

  @Prop({ type: String })
  programManagerName: string;

  @Prop({ type: String })
  programManagerCalendar: string;

  @Prop({ type: String })
  programDiscordChannelName: string;

  @Prop({ type: String })
  programDiscordChannelUrl: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  billingLimits: object;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  billingPlanDowngrade: object;

  @Prop({ type: String })
  billingTaxId: string;

  @Prop({ required: true, type: Boolean, default: false })
  markedForDeletion: boolean;

  @Virtual({
    get(this: any) {
      return this.deletedAt !== null && this.deletedAt !== undefined;
    },
    set(this: any, deleted: Boolean) {
      this.deletedAt = deleted ? new Date() : null;
    }
  })
  $deleted: Boolean;

  @Virtual({
    get(this: any) {
      return this.id;
    },
    set(this: any, id: string) {
      this.id = id;
    }
  })
  $id: string;

  @Virtual({
    get(this: any) {
      return this.updatedAt;
    }
  })
  $updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const OrganizationSchema = SchemaFactory.createForClass(Organization);
export const TargetSchema = SchemaFactory.createForClass(Target);
