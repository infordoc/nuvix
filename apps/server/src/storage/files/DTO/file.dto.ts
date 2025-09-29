import { OmitType } from '@nestjs/swagger'
import {
  IsString,
  IsArray,
  ArrayMaxSize,
  IsOptional,
  Length,
} from 'class-validator'
import { IsCustomID, IsUID } from '@nuvix/core/validators/input.validator'
import { configuration } from '@nuvix/utils'
import { BucketParamsDTO } from '../../DTO/bucket.dto'

export class CreateFileDTO {
  @IsString()
  @IsCustomID()
  declare fileId: string

  /**
   * An array of permission strings. By default, only the current user is granted all permissions. [Learn more about permissions](https://docs.nuvix.in/permissions).
   */
  @IsArray()
  @ArrayMaxSize(configuration.limits.arrayParamsSize)
  @IsOptional()
  permissions?: string[]
}

export class UpdateFileDTO extends OmitType(CreateFileDTO, [
  'fileId',
] as const) {
  /**
   * A name for the file (1-255 characters).
   */
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string
}

// Params

export class FileParamsDTO extends BucketParamsDTO {
  /**
   * The file ID.
   */
  @IsUID()
  declare fileId: string
}

// Query

export class PreviewFileQueryDTO {
  /**
   * Resize preview image width, Pass an integer between 0 to 4000.
   */
  @IsOptional()
  @IsString()
  width?: string

  /**
   * Resize preview image height, Pass an integer between 0 to 4000.
   */
  @IsOptional()
  @IsString()
  height?: string

  /**
   * Image crop gravity. Can be one of center, top-left, top, top-right, left, right, bottom-left, bottom, bottom-right
   */
  @IsOptional()
  @IsString()
  gravity?: string

  /**
   * Preview image quality. Pass an integer between 0 to 100. Defaults to keep existing image quality.
   */
  @IsOptional()
  @IsString()
  quality?: string

  /**
   * Preview image border in pixels. Pass an integer between 0 to 100. Defaults to 0.
   */
  @IsOptional()
  @IsString()
  borderWidth?: string

  /**
   * Preview image border color. Use a valid HEX color, no # is needed for prefix.
   */
  @IsOptional()
  @IsString()
  borderColor?: string

  /**
   * Preview image border radius in pixels. Pass an integer between 0 to 4000.
   */
  @IsOptional()
  @IsString()
  borderRadius?: string

  /**
   * Preview image opacity. Only works with images having an alpha channel (like png). Pass a number between 0 to 1.
   */
  @IsOptional()
  @IsString()
  opacity?: string

  /**
   * Preview image rotation in degrees. Pass an integer between -360 and 360.
   */
  @IsOptional()
  @IsString()
  rotation?: string

  /**
   * Preview image background color. Only works with transparent images (png). Use a valid HEX color, no # is needed for prefix.
   */
  @IsOptional()
  @IsString()
  background?: string

  /**
   * Output format type (jpeg, jpg, png, gif and webp).
   */
  @IsOptional()
  @IsString()
  output?: string
}
