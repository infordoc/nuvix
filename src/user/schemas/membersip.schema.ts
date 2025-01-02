import { Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BaseSchema } from "src/base/schemas/base.schema";


export type MembershipDocument = HydratedDocument<Membership>;


/**
 * Represents a Membership in the Organization.
 */
@Schema({ timestamps: { createdAt: "$createdAt" }, versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true }, virtuals: true, minimize: false })
export class Membership extends BaseSchema {

  @Prop({ type: String, required: true, index: true, unique: true })
  id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, default: "" })
  userName: string;

  @Prop({ type: String, required: true })
  userEmail: string;

  @Prop({ type: String, required: true })
  orgId: string;

  @Prop({ type: String, default: "" })
  orgName: string;

  @Prop({ type: Date, required: true, default: new Date() })
  invited: Date;

  @Prop({ type: Date })
  joined: Date | null;

  @Prop({ type: Boolean, required: true, default: false })
  confirm: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  mfa: boolean;

  @Prop({ type: [String], required: true, default: [] })
  roles: string[];

  @Virtual({
    get(this: any) {
      return this.id;
    },
    set(...args) {
      this.id = args[0];
    }
  })
  $id: string;

  @Virtual({
    get(this: any) {
      return this.updatedAt;
    }
  })
  $updatedAt: Date;

  @Virtual({
    get(this: any) {
      return this.orgId
    },
    set(...args) {
      this.orgId = args[0]
    }
  })
  teamId: string;

  @Virtual({
    get(this: any) {
      return this.orgName
    },
    set(...args) {
      this.orgName = args[0]
    }
  })
  teamName: string
}

export const MembershipSchema = SchemaFactory.createForClass(Membership)