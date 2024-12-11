import { ObjectType, Field, Int } from '@nestjs/graphql';
import BaseObject from 'src/Utils/base.object';

@ObjectType()
export class Session extends BaseObject {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
