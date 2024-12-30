import { Controller, Get, Query, Res } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { Response } from 'express';
import sharp from 'sharp';

@Controller()
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) { }

  @Get('initials')
  async generateAvatar(
    @Query('name') name: string = 'NA',
    @Query('width') width: number = 100,
    @Query('height') height: number = 100,
    @Query('background') background: string = '#3498db',
    @Res() res: Response
  ) {
    const svg = this.avatarsService.createSvg(name, Number(width), Number(height), background);
    const buffer = Buffer.from(svg);
    const finalImage = await sharp(buffer)
      .resize(Number(width), Number(height))
      .toFormat('png')
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(finalImage);
  }
}
