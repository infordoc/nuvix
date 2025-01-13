import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ProjectDocument } from "src/projects/schemas/project.schema";
import { ClsService } from 'nestjs-cls';
import { PROJECT } from "src/Utils/constants";


export const Project = createParamDecorator<ProjectDocument>(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const cls: ClsService = ctx.switchToHttp().getRequest().cls;
    return cls.get(PROJECT);
  },
);