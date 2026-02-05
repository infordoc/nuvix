import { IsNotEmpty, IsString } from 'class-validator'

export class CreditCardParamDTO {
  /**
   * Credit card code (e.g., 'visa', 'mastercard', etc.)
   */
  @IsString()
  @IsNotEmpty()
  declare code: string
}

export class BrowsersParamDTO {
  /**
   * Browser code (e.g., 'ch', 'ff', etc.)
   */
  @IsString()
  @IsNotEmpty()
  declare code: string
}

export class FlagsParamDTO {
  /**
   * Country code (e.g., 'us', 'in', etc.)
   */
  @IsString()
  @IsNotEmpty()
  declare code: string
}
