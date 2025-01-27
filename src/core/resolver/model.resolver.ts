import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Mode = createParamDecorator<Document>(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    let modes = request.headers['x-nuvix-mode'] || request.query['mode'];

    if (!modes) {
      return null;
    }

    if (Array.isArray(modes)) {
      modes = modes[0];
    }

    if (typeof modes === 'string' && modes.includes(',')) {
      modes = modes.split(',')[0];
    }

    return modes;
  },
);
