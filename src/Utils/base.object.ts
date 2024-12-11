import { Field } from "@nestjs/graphql";


export default abstract class BaseObject {
  @Field({ description: 'Unique identifier of an Entity' })
  _id: string;

  @Field({ description: 'Date of creation' })
  _createdAt: Date;

  @Field({ description: 'Date of last update' })
  _updatedAt: Date;

  @Field({ description: 'Date of deletion' })
  _deletedAt: Date | null;
}