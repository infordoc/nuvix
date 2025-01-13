import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { PROJECT_USER } from "src/Utils/constants";
import { UserEntity } from "../entities/users/user.entity";


export const User = createParamDecorator<any, any, UserEntity | null>(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (!request[PROJECT_USER]) {
      return null;
    }
    return request[PROJECT_USER];
  },
);