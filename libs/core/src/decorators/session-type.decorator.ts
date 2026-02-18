import { applyDecorators, UseGuards } from '@nestjs/common'
import { RouteConfig } from '@nestjs/platform-fastify'
import { RouteContext, SessionType } from '@nuvix/utils'
import { SessionTypeGuard } from '../resolvers/guards'

export function AllowSessionType(type: SessionType): any {
  return applyDecorators(
    UseGuards(SessionTypeGuard),
    RouteConfig({
      [RouteContext.SESSION_TYPE]: type,
    }),
  )
}
