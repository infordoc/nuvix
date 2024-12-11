import { ObjectType, Field, Int } from '@nestjs/graphql';
import BaseObject from 'src/Utils/base.object';

/**
 * @type ObjectType
 * User object (GraphQL)
 */
@ObjectType()
export class User extends BaseObject {
  @Field({ description: 'Unique identifier of the user' })
  email: string;
}