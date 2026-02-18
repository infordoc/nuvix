import { applyDecorators, UseGuards } from '@nestjs/common'
import { SessionType } from '@nuvix/utils'
import { SessionTypeGuard } from '../resolvers/guards'
import { Reflector } from '@nestjs/core'

export const AllowedSessionType = Reflector.createDecorator<SessionType>()
export function AllowSessionType(type: SessionType): any {
  return applyDecorators(UseGuards(SessionTypeGuard), AllowedSessionType(type))
}
