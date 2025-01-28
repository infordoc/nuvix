import { IsString, IsJSON, IsOptional, IsArray } from 'class-validator';
import { IsUID } from 'src/core/validators/input.validator';

export class CreateDocumentDTO {
  @IsString()
  @IsUID()
  documentId: string;

  data: object;

  @IsOptional()
  @IsArray()
  permissions: string[];
}
