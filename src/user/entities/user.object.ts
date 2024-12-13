import { ObjectType, Field, ArgsType, InputType } from '@nestjs/graphql';
import BaseObject, { StringFilter, BaseArgs, BaseFilter } from 'src/base/objects/base.object';
import { Paginated } from 'src/Utils/base.object';

/**
 * @type ObjectType
 * User object (GraphQL)
 */
@ObjectType()
export class User extends BaseObject {
  @Field({ description: 'Unique identifier of the user' })
  email: string;
}

/**
 * @type ObjectType
 * - User connection object (GraphQL)
 */
@ObjectType()
export class UserConnection extends Paginated(User) { }

@InputType()
export class UserFilterInput extends BaseFilter {
  @Field(() => StringFilter, { nullable: true })
  email: StringFilter;

  @Field(() => [UserFilterInput], { nullable: true })
  and: UserFilterInput[];

  @Field(() => [UserFilterInput], { nullable: true })
  or: UserFilterInput[];

  @Field(() => UserFilterInput, { nullable: true })
  not: UserFilterInput;
}

@ArgsType()
export class UserArgs extends BaseArgs {
  @Field(() => UserFilterInput, { nullable: true })
  filter: UserFilterInput;
}