import { IsString, IsIn, IsArray, ArrayMaxSize } from 'class-validator';
import { APP_LIMIT_ARRAY_PARAMS_SIZE } from '@nuvix/utils';
import { Database } from '@nuvix-tech/db';

export class CreateIndexDTO {
  @IsString()
  key: string;

  @IsIn([IndexType.Key, IndexType.FullText, IndexType.Unique])
  type: string;

  @IsArray()
  @ArrayMaxSize(APP_LIMIT_ARRAY_PARAMS_SIZE)
  @IsString({ each: true })
  attributes: string[];

  @IsArray()
  @ArrayMaxSize(APP_LIMIT_ARRAY_PARAMS_SIZE)
  @IsIn(['ASC', 'DESC'], { each: true })
  orders: string[];
}
