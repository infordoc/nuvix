import { Prop, Schema, Virtual } from "@nestjs/mongoose";



export class BaseSchema {

  @Prop({ type: Date, default: null })
  $deletedAt: Date;

  @Prop({ type: [String], default: [] })
  $permissions: string[];

}