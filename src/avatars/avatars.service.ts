import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, registerFont } from 'canvas';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import { FastifyReply } from 'fastify';

@Injectable()
export class AvatarsService {
  private readonly logger = new Logger(AvatarsService.name);

  constructor() {
    registerFont(
      path.resolve(__dirname, '../../assets/fonts/Varela-Regular.ttf'),
      { family: 'Varela' },
    );
  }

  async generateAvatar({
    name,
    width = 100,
    height = 100,
    background,
    circle,
    res,
  }: {
    name: string;
    width: number | string;
    height: number | string;
    background: string;
    circle: boolean | string;
    res: FastifyReply;
  }) {
    try {
      width = Number(width);
      height = Number(height);
      circle = circle === true || circle === 'true'; // Handle boolean query
      background = `#${background.replace(/[^0-9a-fA-F]/g, '')}`; // Sanitize background color

      const cacheKey = this.generateCacheKey(
        name,
        width,
        height,
        background,
        circle,
      );
      const cachedImage = this.getCachedImage(cacheKey);
      if (cachedImage) {
        res.header('Content-Type', 'image/png');
        return res.send(cachedImage);
      }

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Draw Background (circle or rectangle)
      if (circle) {
        ctx.beginPath();
        ctx.arc(
          width / 2,
          height / 2,
          Math.min(width, height) / 2,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = background;
        ctx.fill();
      } else {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Text
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.min(width, height) / 2}px Varela`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.getInitials(name), width / 2, height / 2);

      // Convert Canvas to PNG Buffer
      const buffer = canvas.toBuffer('image/png');

      // Process Image with Sharp (for better output)
      const processedImage = await sharp(buffer)
        .resize(width, height)
        .png()
        .toBuffer();

      // Store in cache
      this.cacheImage(cacheKey, processedImage);

      // Send Image Response
      res.header('Content-Type', 'image/png');
      res.send(processedImage);
    } catch (error) {
      console.error('Error generating avatar:', error);
      res.status(500).send('Error generating avatar');
    }
  }

  private getInitials(name: string): string {
    const words = name.split(' ').filter(Boolean);
    return words.length > 1
      ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
      : words[0].substring(0, 2).toUpperCase();
  }

  private generateCacheKey(
    name: string,
    width: number,
    height: number,
    background: string,
    circle: boolean,
  ): string {
    return crypto
      .createHash('md5')
      .update(`${name}-${width}-${height}-${background}-${circle}`)
      .digest('hex');
  }

  private cache: Record<string, Buffer> = {};

  private getCachedImage(key: string): Buffer | null {
    return this.cache[key] || null;
  }

  private cacheImage(key: string, image: Buffer): void {
    this.cache[key] = image;
  }
}
