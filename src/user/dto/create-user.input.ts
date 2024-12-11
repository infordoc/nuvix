import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'First name of the user' })
  firstName: string;

  @Field(() => String, { description: 'Last name of the user', nullable: true })
  lastName: string | null;

  @Field(() => String, { description: 'Username of the user' })
  username: string;

  @Field(() => String, { description: 'Email of the user' })
  email: string;

  @Field(() => Date, { description: 'Date of birth of the user', nullable: true })
  dateOfBirth: Date;

  @Field(() => String, { description: 'Preferences of the user', nullable: true })
  preferences: Record<string, any>;

  @Field(() => String, { description: 'Status of the user' })
  status: 'active' | 'inactive' | 'suspended';

  @Field(() => Date, { description: 'Last login time of the user', nullable: true })
  lastLoginAt: Date;

  @Field(() => Date, { description: 'Last failed login time of the user', nullable: true })
  lastFailedLoginAt: Date;

  @Field(() => Boolean, { description: 'Is the user verified' })
  isVerified: boolean;

  @Field(() => Date, { description: 'Email verified time of the user', nullable: true })
  emailVerifiedAt: Date;

  @Field(() => String, { description: 'Phone number of the user', nullable: true })
  phoneNumber: string;

  @Field(() => Boolean, { description: 'Is the user deleted' })
  isDeleted: boolean;

  @Field(() => String, { description: 'Metadata of the user', nullable: true })
  metadata: Record<string, any>;
}