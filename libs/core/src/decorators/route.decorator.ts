import { configuration, type ThrottleOptions } from '@nuvix/utils'
import {
  applyDecorators,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Options,
  Head,
  All,
  type Type,
  HttpStatus,
} from '@nestjs/common'
import {
  AuditEvent,
  type _AuditEvent,
  type AuditEventKey,
} from './events.decorator'
import { Auth, type AuthType } from './sdk.decorator'
import { Scope } from './scope.decorator'
import type { Scopes } from '../config'
import { Throttle } from './throttle.decorator'
import { ResModel } from './res-model.decorator'
import type { ResolverTypeContextOptions } from '../resolvers'
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger'
import * as fs from 'fs'

type RouteMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'ALL'

interface ApiResponseConfig {
  status: HttpStatus | number
  description?: string
  type?: Type<any>
}

/**
 * Configuration options for SDK generation and documentation
 */
export interface SdkOptions {
  /** The name of the SDK method */
  name: string
  /** HTTP status code for successful responses */
  code?: HttpStatus | number
  /** Path to markdown file for detailed description */
  descMd?: string
  /** Custom API response configurations */
  responses?: ApiResponseConfig[]
  /** SDK version information */
  version?: string
  /** Whether this is an internal-only endpoint */
  internal?: boolean
  /** Whether this endpoint is experimental */
  experimental?: boolean
  /** Whether this endpoint is deprecated */
  deprecated?: boolean
  /** Whether to hide this endpoint from documentation */
  hidden?: boolean
}

/**
 * Configuration options for API route definition
 */
export interface RouteOptions {
  /** URL path or array of paths for the route */
  path?: string | string[]
  /** Description of the route functionality */
  description?: string
  /** Brief summary for API documentation */
  summary: string
  /** Tags for grouping routes in documentation */
  tags?: string[]
  /** Authentication type(s) required for this route */
  auth?: AuthType | AuthType[]
  /** @deprecated Whether this endpoint is publicly accessible (no auth required) */
  public?: boolean
  /** HTTP method(s) for this route */
  method?: RouteMethod | RouteMethod[]
  /** Authorization scope(s) required */
  scopes?: Scopes | Scopes[]
  /** Audit event configuration for logging */
  audit?: { key: AuditEventKey } & _AuditEvent
  /** Rate limiting configuration */
  throttle?: number | ThrottleOptions
  /** Response model configuration for serialization */
  model?:
    | Type<any>
    | ResolverTypeContextOptions
    | { type: Type<unknown>; options: ResolverTypeContextOptions }
  /** SDK generation options */
  sdk?: SdkOptions
  /** Unique operation identifier for OpenAPI */
  operationId?: string
  /** Include in Open api schema */
  docs?: boolean
}

const HTTP_METHOD_DECORATORS = {
  GET: Get,
  POST: Post,
  PUT: Put,
  PATCH: Patch,
  DELETE: Delete,
  OPTIONS: Options,
  HEAD: Head,
  ALL: All,
} as const

const readMarkdownFile = (filePath: string): string | null => {
  try {
    const fullPath = configuration.assets.get(filePath)
    if (!fs.existsSync(fullPath)) {
      console.warn(`Markdown file not found: ${fullPath}`)
      return null
    }

    const fileContent = fs.readFileSync(fullPath, 'utf-8')
    return fileContent.trim()
  } catch (error) {
    console.error(`Error reading markdown file ${filePath}:`, error)
    return null
  }
}

const validateRouteOptions = (options: RouteOptions): void => {
  if (options.method) {
    const methods = Array.isArray(options.method)
      ? options.method
      : [options.method]
    const invalidMethods = methods.filter(
      method => !Object.keys(HTTP_METHOD_DECORATORS).includes(method),
    )

    if (invalidMethods.length > 0) {
      throw new Error(`Invalid HTTP methods: ${invalidMethods.join(', ')}`)
    }
  }

  if (options.sdk && options.sdk.responses) {
    const invalidStatuses = options.sdk.responses.filter(
      response =>
        typeof response.status !== 'number' ||
        response.status < 100 ||
        response.status >= 600,
    )

    if (invalidStatuses.length > 0) {
      throw new Error('Invalid HTTP status codes in responses')
    }
  }
}

export const Route = (options: RouteOptions) => {
  validateRouteOptions(options)

  const decorators = []

  // Handle HTTP method decorators
  const methods = options.method
    ? Array.isArray(options.method)
      ? options.method
      : [options.method]
    : ['GET']

  const routePath = options.path || ''

  for (const method of methods) {
    const DecoratorClass =
      HTTP_METHOD_DECORATORS[method as keyof typeof HTTP_METHOD_DECORATORS]
    if (!DecoratorClass) {
      throw new Error(`Unsupported HTTP method: ${method}`)
    }
    decorators.push(DecoratorClass(routePath))
  }

  // Authentication
  if (options.auth) {
    decorators.push(Auth(options.auth))
  }

  // Authorization scopes
  if (options.scopes) {
    decorators.push(Scope(options.scopes))
  }

  // Audit events
  if (options.audit) {
    const { key, ...rest } = options.audit
    decorators.push(AuditEvent(key as AuditEventKey, rest))
  }

  // Rate limiting
  if (options.throttle) {
    decorators.push(Throttle(options.throttle as any))
  }

  // Response model
  if (options.model) {
    decorators.push(ResModel(options.model as any))
  }

  // Prepare description for API documentation
  let description = options.description
  if (options.sdk?.descMd) {
    const markdownContent = readMarkdownFile(options.sdk.descMd)
    if (markdownContent) {
      description = markdownContent
    }
  }

  // API tags (groups)
  const apiTags = options.tags
  if (apiTags?.length) {
    decorators.push(ApiTags(...apiTags))
  }

  // API operation documentation
  decorators.push(
    ApiOperation({
      summary: options.summary || options.description,
      description,
      tags: apiTags,
      deprecated: options.sdk?.deprecated,
      operationId: options.operationId || options.sdk?.name,
    }),
  )

  // Custom API responses
  if (options.sdk?.responses?.length) {
    options.sdk.responses.forEach(response => {
      decorators.push(
        ApiResponse({
          status: response.status,
          description: response.description,
          type: response.type,
        }),
      )
    })
  }

  // SDK configuration
  if (options.sdk) {
    ///
  }

  return applyDecorators(...decorators)
}

// Convenience decorators for common patterns
export const GetRoute = (
  path: string | string[],
  options: Omit<RouteOptions, 'method' | 'path'>,
) => Route({ ...options, method: 'GET', path })

export const PostRoute = (
  path: string | string[],
  options: Omit<RouteOptions, 'method' | 'path'>,
) => Route({ ...options, method: 'POST', path })

export const PutRoute = (
  path: string | string[],
  options: Omit<RouteOptions, 'method' | 'path'>,
) => Route({ ...options, method: 'PUT', path })

export const PatchRoute = (
  path: string | string[],
  options: Omit<RouteOptions, 'method' | 'path'>,
) => Route({ ...options, method: 'PATCH', path })

export const DeleteRoute = (
  path: string | string[],
  options: Omit<RouteOptions, 'method' | 'path'>,
) => Route({ ...options, method: 'DELETE', path })
