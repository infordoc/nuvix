import { Reflector } from '@nestjs/core'
import { services } from '../config/services'
import {
  APP_AUTH_TYPE_ADMIN,
  APP_AUTH_TYPE_JWT,
  APP_AUTH_TYPE_KEY,
  APP_AUTH_TYPE_SESSION,
} from '@nuvix/utils'
export const Namespace = Reflector.createDecorator<keyof typeof services>()

export enum AuthType {
  SESSION = APP_AUTH_TYPE_SESSION,
  JWT = APP_AUTH_TYPE_JWT,
  KEY = APP_AUTH_TYPE_KEY,
  ADMIN = APP_AUTH_TYPE_ADMIN,
}

export const Auth = Reflector.createDecorator<AuthType | AuthType[]>()
