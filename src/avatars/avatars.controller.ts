import { Controller, Get, Query, Res } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { Response } from 'express';
import { createCanvas } from 'canvas';

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
    const canvas = createCanvas(Math.max(1, Number(width)), Math.max(1, Number(height)));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, Number(width), Number(height));

    ctx.font = `${Number(width) / 2}px sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.avatarsService.getInitials(name), Number(width) / 2, Number(height) / 2);

    res.set('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);

  }
}
