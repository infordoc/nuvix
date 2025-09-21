import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ResponseInterceptor } from '@nuvix/core/resolvers/interceptors/response.interceptor';
import { FilesService } from './files.service';
import { Models } from '@nuvix/core/helper/response.helper';
import { Database, Doc, Query as Queries } from '@nuvix/db';
import { ProjectGuard } from '@nuvix/core/resolvers/guards/project.guard';
import {
  MultipartParam,
  ResModel,
  ProjectDatabase,
  UploadedFile,
  Project,
  Namespace,
} from '@nuvix/core/decorators';

import { UpdateFileDTO } from './DTO/file.dto';
import { ApiInterceptor } from '@nuvix/core/resolvers/interceptors/api.interceptor';
import { ParseDuplicatePipe } from '@nuvix/core/pipes/duplicate.pipe';
import { type SavedMultipartFile } from '@fastify/multipart';
import { User } from '@nuvix/core/decorators/project-user.decorator';
import { Exception } from '@nuvix/core/extend/exception';
import { FilesQueryPipe } from '@nuvix/core/pipes/queries';

@Namespace('storage')
@UseGuards(ProjectGuard)
@Controller({ version: ['1'], path: 'storage/buckets/:id/files' })
@UseInterceptors(ApiInterceptor, ResponseInterceptor)
export class FilesController {
  private readonly logger = new Logger(FilesController.name);
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ResModel({ type: Models.FILE, list: true })
  async getFiles(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Query('queries', FilesQueryPipe) queries?: Queries[],
    @Query('search') search?: string,
  ) {
    return this.filesService.getFiles(db, id, queries, search);
  }

  @Post()
  @ResModel(Models.FILE)
  async createFile(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @MultipartParam('fileId') fileId: string,
    @MultipartParam('permissions') permissions: string[] = [],
    @UploadedFile() file: SavedMultipartFile,
    @Req() req: NuvixRequest,
    @User() user: Doc,
    @Project() project: Doc,
  ) {
    if (!fileId)
      throw new Exception(Exception.INVALID_PARAMS, 'fileId is required');
    return this.filesService.createFile(
      db,
      id,
      { fileId, permissions },
      file,
      req,
      user,
      project,
    );
  }

  @Get(':fileId')
  @ResModel(Models.FILE)
  async getFile(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    return this.filesService.getFile(db, id, fileId);
  }

  @Get(':fileId/preview')
  async previewFile(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Req() req: NuvixRequest,
    @Project() project: Doc,
    @Query('width', ParseDuplicatePipe, new ParseIntPipe({ optional: true }))
    width?: string,
    @Query('height', ParseDuplicatePipe, new ParseIntPipe({ optional: true }))
    height?: string,
    @Query('gravity', ParseDuplicatePipe) gravity?: string,
    @Query('quality', ParseDuplicatePipe, new ParseIntPipe({ optional: true }))
    quality?: string,
    @Query(
      'borderWidth',
      ParseDuplicatePipe,
      new ParseIntPipe({ optional: true }),
    )
    borderWidth?: string,
    @Query('borderColor', ParseDuplicatePipe) borderColor?: string,
    @Query(
      'borderRadius',
      ParseDuplicatePipe,
      new ParseIntPipe({ optional: true }),
    )
    borderRadius?: string,
    @Query('opacity', ParseDuplicatePipe, new ParseIntPipe({ optional: true }))
    opacity?: string,
    @Query('rotation', ParseDuplicatePipe, new ParseIntPipe({ optional: true }))
    rotation?: string,
    @Query('background', ParseDuplicatePipe) background?: string,
    @Query('output', ParseDuplicatePipe) output?: string,
  ) {
    return this.filesService.previewFile(
      db,
      id,
      fileId,
      {
        width,
        height,
        gravity,
        quality,
        borderWidth,
        borderColor,
        borderRadius,
        opacity,
        rotation,
        background,
        output,
      } as any,
      project,
    );
  }

  @Get(':fileId/download')
  async downloadFile(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Req() req: NuvixRequest,
    @Res({ passthrough: true }) res: any,
    @Project() project: Doc,
  ) {
    return this.filesService.downloadFile(db, id, fileId, res, req, project);
  }

  @Get(':fileId/view')
  async viewFile(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Req() req: NuvixRequest,
    @Res({ passthrough: true }) res: any,
    @Project() project: Doc,
  ) {
    return this.filesService.viewFile(db, id, fileId, res, req, project);
  }

  @Get(':fileId/push')
  async getFileForPushNotification(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Query('jwt') jwt: string,
    @Req() req: NuvixRequest,
    @Res({ passthrough: true }) res: any,
    @Project() project: Doc,
  ) {
    return this.filesService.getFileForPushNotification(
      db,
      id,
      fileId,
      jwt,
      req,
      res,
      project,
    );
  }

  @Put(':fileId')
  @ResModel(Models.FILE)
  async updateFile(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Body() updateFileDTO: UpdateFileDTO,
  ) {
    return this.filesService.updateFile(db, id, fileId, updateFileDTO);
  }

  @Delete(':fileId')
  @ResModel(Models.NONE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(
    @ProjectDatabase() db: Database,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Project() project: Doc,
  ) {
    return this.filesService.deleteFile(db, id, fileId, project);
  }
}
