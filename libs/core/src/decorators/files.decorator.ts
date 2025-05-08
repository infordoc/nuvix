import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Exception } from '../extend/exception';
import { MultipartValue } from '@fastify/multipart';

export const UploadedFile = createParamDecorator(
  async (data: string = 'file', ctx: ExecutionContext) => {
    const request: FastifyRequest = ctx
      .switchToHttp()
      .getRequest<FastifyRequest>();

    const file = request.body[data];
    if (!file) {
      throw new Exception(Exception.STORAGE_INVALID_FILE);
    }
    return file;
  },
);

export const MultipartParam = createParamDecorator(
  async (data: string, ctx: ExecutionContext) => {
    const request: FastifyRequest = ctx
      .switchToHttp()
      .getRequest<FastifyRequest>();

    const param = request.body[data] as MultipartValue;
    return param ? param.value : undefined;
  },
);
