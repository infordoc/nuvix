import { Controller, Get, Query, Res } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Exception } from 'src/core/extend/exception';

@Controller({ version: ['1'], path: 'avatars' })
export class AvatarsController {
  constructor(
    private readonly avatarsService: AvatarsService,
    private httpService: HttpService,
  ) { }

  @Get('initials')
  async generateAvatar(
    @Query('name') name: string = 'NA',
    @Query('width') width: number = 100,
    @Query('height') height: number = 100,
    @Query('background') background: string = '3498db',
    @Query('circle') circle: boolean = false,
    @Res() res: Response,
  ) {
    return this.avatarsService.generateAvatar(
      name,
      width,
      height,
      background,
      circle,
      res,
    );
  }
}
