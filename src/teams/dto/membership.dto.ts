import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MaxLength, IsArray, ArrayMaxSize, IsUrl, IsOptional } from 'class-validator';
import { APP_LIMIT_ARRAY_PARAMS_SIZE } from 'src/Utils/constants';


export class CreateMembershipDto {
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsPhoneNumber(null)
  @IsNotEmpty()
  phone: string;

  @IsArray()
  @ArrayMaxSize(APP_LIMIT_ARRAY_PARAMS_SIZE)
  @IsString({ each: true })
  roles: string[];

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  name: string;
}