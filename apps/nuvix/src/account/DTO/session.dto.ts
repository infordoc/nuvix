import { oAuthProvidersList } from '@nuvix/core/config/authProviders';
import {
  APP_LIMIT_ARRAY_ELEMENT_SIZE,
  APP_LIMIT_ARRAY_PARAMS_SIZE,
} from '@nuvix/utils/constants';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEmailSessionDTO {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}

export class CreateSessionDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @Length(200, 256)
  secret: string;
}

export class CreateOAuth2SessionDTO {
  @IsString()
  @IsIn(oAuthProvidersList)
  provider: (typeof oAuthProvidersList)[0];

  @IsUrl()
  success: string;

  @IsUrl()
  failure: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(APP_LIMIT_ARRAY_ELEMENT_SIZE, { each: true })
  @ArrayMaxSize(APP_LIMIT_ARRAY_PARAMS_SIZE)
  scopes: string[];
}
