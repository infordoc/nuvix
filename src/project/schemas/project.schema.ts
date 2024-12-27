import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

/**
 * Represents a project with its details.
 */
@Schema({ timestamps: true })
export class Project {
  /**
   * Unique identifier for the project.
   * @type {string}
   */
  @Prop({ required: true, type: String, index: true, unique: true })
  $id: string;

  /**
   * User of the project.
   * @type {string}
   */
  @Prop({ required: true, type: String, index: true })
  $userId: string;

  /**
   * Name of the project.
   * @type {string}
   */
  @Prop({ required: true, type: String })
  name: string;

  /**
   * Identifier for the organization to which the project belongs.
   * @type {string}
   */
  @Prop({ required: true, type: String, index: true })
  orgnizationId: string;

  /**
   * List of services associated with the project.
   * Each service has a name and a status.
   * @type {Record<string, any>[]}
   */
  @Prop({
    type: [
      {
        name: String,
        status: String,
      },
    ],
    default: [],
  })
  services: Record<string, any>[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
