import { applyDecorators, UseGuards } from '@nestjs/common'
import { ThrottlerGuard } from '../resolvers/guards'
import { RouteConfig } from '@nestjs/platform-fastify'
import { RouteContext, type ThrottleOptions } from '@nuvix/utils'

export function Throttle(limit: number): any
export function Throttle(options: ThrottleOptions): any
export function Throttle(options: ThrottleOptions | number): any {
  return applyDecorators(
    UseGuards(ThrottlerGuard),
    RouteConfig({
      [RouteContext.RATE_LIMIT]:
        typeof options === 'number' ? { limit: options } : options,
    }),
  )
}
