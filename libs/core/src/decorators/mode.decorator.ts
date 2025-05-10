import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import ParamsHelper from '../helper/params.helper';
import { APP_MODE_DEFAULT } from '@nuvix/utils/constants';

export const Mode = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: NuvixRequest = ctx.switchToHttp().getRequest<NuvixRequest>();

    const params = new ParamsHelper(request);

    const mode =
      params.getFromHeaders('x-nuvix-mode') ||
      params.getFromQuery('mode', APP_MODE_DEFAULT);

    return mode;
  },
);
