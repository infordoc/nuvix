import { IsString } from 'class-validator';

export class ExtensionNameParamDto {
  @IsString()
  name: string;
}
