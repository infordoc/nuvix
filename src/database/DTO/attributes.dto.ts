import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { IsKey } from 'src/core/validators/input.validator';
import { APP_DATABASE_ATTRIBUTE_STRING_MAX_LENGTH } from 'src/Utils/constants';

export class CreateStringAttributeDTO {
  @IsString()
  @IsKey()
  key: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(APP_DATABASE_ATTRIBUTE_STRING_MAX_LENGTH)
  size?: number = null;

  @IsOptional()
  @IsBoolean()
  required?: boolean = null;

  @IsOptional()
  @IsString()
  default?: string = null;

  @IsOptional()
  @IsBoolean()
  array?: boolean = false;

  @IsOptional()
  @IsBoolean()
  encrypt?: boolean = false;
}

export class CreateEmailAttributeDTO extends OmitType(
  CreateStringAttributeDTO,
  ['encrypt', 'size'],
) {}

export class CreateEnumAttributeDTO extends OmitType(CreateStringAttributeDTO, [
  'encrypt',
  'size',
]) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 1024, { each: true })
  elements?: string[] = [];
}

export class CreateIpAttributeDTO extends OmitType(CreateStringAttributeDTO, [
  'encrypt',
  'size',
]) {}

export class CreateURLAttributeDTO extends OmitType(CreateStringAttributeDTO, [
  'encrypt',
  'size',
]) {}

export class CreateIntegerAttributeDTO extends OmitType(
  CreateStringAttributeDTO,
  ['size', 'encrypt'],
) {
  @IsOptional()
  @IsInt()
  min?: number = null;

  @IsOptional()
  @IsInt()
  max?: number = null;
}

export class CreateFloatAttributeDTO extends CreateIntegerAttributeDTO {}

export class CreateBooleanAttributeDTO extends OmitType(
  CreateStringAttributeDTO,
  ['size', 'encrypt'],
) {}

export class CreateDatetimeAttributeDTO extends OmitType(
  CreateStringAttributeDTO,
  ['size', 'encrypt'],
) {}

export class CreateRelationAttributeDTO {
  @IsString()
  @IsKey()
  relatedCollectionId: string;

  @IsString()
  @IsKey()
  type: string;

  @IsOptional()
  @IsBoolean()
  twoWay?: boolean = false;

  @IsString()
  @IsKey()
  key: string;

  @IsOptional()
  @IsString()
  @IsKey()
  twoWayKey?: string = null;

  @IsString()
  @IsKey()
  onDelete: string;
}

// Update DTOs

export class UpdateStringAttributeDTO extends PartialType(
  OmitType(CreateStringAttributeDTO, ['array', 'encrypt', 'key']),
) {
  @IsOptional()
  @IsString()
  newKey?: string = null;
}

export class UpdateEmailAttributeDTO extends UpdateStringAttributeDTO {}

export class UpdateEnumAttributeDTO extends PartialType(
  CreateEnumAttributeDTO,
) {}

export class UpdateIpAttributeDTO extends PartialType(CreateIpAttributeDTO) {}

export class UpdateURLAttributeDTO extends PartialType(CreateURLAttributeDTO) {}

export class UpdateIntegerAttributeDTO extends PartialType(
  CreateIntegerAttributeDTO,
) {}

export class UpdateFloatAttributeDTO extends PartialType(
  CreateFloatAttributeDTO,
) {}

export class UpdateBooleanAttributeDTO extends PartialType(
  CreateBooleanAttributeDTO,
) {}

export class UpdateDatetimeAttributeDTO extends PartialType(
  CreateDatetimeAttributeDTO,
) {}

export class UpdateRelationAttributeDTO extends PartialType(
  CreateRelationAttributeDTO,
) {}
