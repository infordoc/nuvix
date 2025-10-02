import {
  ArrayMaxSize,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

export class UpdateSmtpDTO {
  /**
   * Enable custom SMTP service
   */
  @IsBoolean()
  declare enabled: boolean

  /**
   * Name of the email sender
   */
  @IsOptional()
  @IsString()
  @Length(0, 255)
  @IsNotEmpty()
  senderName?: string

  /**
   * Email of the sender
   */
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  senderEmail?: string

  /**
   * Reply to email
   */
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  replyTo?: string

  /**
   * SMTP server host name
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  host?: string

  /**
   * SMTP server port
   */
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  port?: number

  /**
   * SMTP server username
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string

  /**
   * SMTP server password
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string

  /**
   * Does SMTP server use secure connection'
   */
  @IsOptional()
  @IsIn(['tls', 'ssl'])
  @IsNotEmpty()
  secure?: 'tls' | 'ssl'
}

export class SmtpTestsDTO {
  /**
   * Array of emails to send test email to. Maximum of 10 emails are allowed.
   */
  @IsEmail({}, { each: true })
  @ArrayMaxSize(10)
  declare emails: string[]

  /**
   * Name of the email sender
   */
  @IsString()
  @Length(0, 255)
  @IsNotEmpty()
  declare senderName: string

  /**
   * Email of the sender
   */
  @IsEmail()
  @IsNotEmpty()
  declare senderEmail: string

  /**
   * Reply to email
   */
  @IsEmail()
  @IsOptional()
  replyTo?: string

  /**
   * SMTP server host name
   */
  @IsString()
  @IsNotEmpty()
  declare host: string

  /**
   * SMTP server port
   */
  @IsInt()
  @IsOptional()
  port?: number

  /**
   * SMTP server username
   */
  @IsString()
  @IsOptional()
  username?: string

  /**
   * SMTP server password
   */
  @IsString()
  @IsOptional()
  password?: string

  /**
   * Does SMTP server use secure connection
   */
  @IsIn(['tls', 'ssl'])
  @IsOptional()
  secure?: 'tls' | 'ssl'
}
