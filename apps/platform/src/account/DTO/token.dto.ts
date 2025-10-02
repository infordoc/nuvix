import { IsUID } from '@nuvix/core/validators'
import { IsOptional, IsNotEmpty, IsEmail, IsBoolean } from 'class-validator'

export class CreateEmailTokenDTO {
  /**Unique Id. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars. If the email address has never been used, a new account is created using the provided userId. Otherwise, if the email address is already attached to an account, the user ID is ignored. */
  @IsUID()
  declare userId: string

  /**
   * User email.
   */
  @IsNotEmpty()
  @IsEmail()
  declare email: string

  /**
   * Toggle for security phrase. If enabled, email will be send with a randomly generated phrase and the phrase will also be included in the response. Confirming phrases match increases the security of your authentication flow.
   */
  @IsOptional()
  @IsBoolean()
  phrase?: boolean = false
}
