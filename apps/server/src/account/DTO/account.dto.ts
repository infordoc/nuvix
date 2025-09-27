import {
  IsEmail,
  IsString,
  Length,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator'
import { IsCustomID } from '@nuvix/core/validators/input.validator'

export class CreateAccountDTO {
  /**
   * User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
   */
  @IsCustomID()
  userId!: string

  /**
   * User email.
   */
  @IsEmail({}, { message: 'Invalid email address.' })
  email!: string

  /**New user password. Must be between 8 and 256 chars. */
  @Length(8, 256, { message: 'Password must be between 8 and 256 characters.' })
  password!: string

  /**
   * User name. Max length: 128 chars.
   */
  @IsOptional()
  @IsString()
  @Length(0, 128, {
    message: 'User name can have a maximum length of 128 characters.',
  })
  name?: string
}

export class UpdatePrefsDTO {
  @IsObject()
  prefs!: { [key: string]: any }
}

export class UpdateEmailDTO {
  @IsEmail()
  email!: string

  @IsNotEmpty()
  @IsString()
  password!: string
}

export class UpdatePasswordDTO {
  @IsNotEmpty()
  @IsString()
  @Length(8, 256, { message: 'Password must be between 8 and 256 characters.' })
  password!: string

  @IsNotEmpty()
  @IsString()
  oldPassword!: string
}

export class UpdateNameDTO {
  @IsNotEmpty()
  @IsString()
  name!: string
}

export class UpdatePhoneDTO {
  @IsNotEmpty()
  @IsString()
  phone!: string

  @IsNotEmpty()
  @IsString()
  password!: string
}

export class UpdateAccountStatusDTO {
  @IsBoolean()
  status!: boolean
}
