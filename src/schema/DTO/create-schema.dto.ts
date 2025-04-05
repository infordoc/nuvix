import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentSchema {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
