import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Database } from '@nuvix/db'
import { Exception } from '@nuvix/core/extend/exception'
import { CURRENT_SCHEMA_DB } from '@nuvix/utils'

// May be we should use RouteConfig to restrict access to document schemas only
// in the controllers where this guard is applied.
// Because this guard does not have metadata about current schema type.
// keeping it for now as is.

@Injectable()
export class DocSchemaGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const schemaDb = req[CURRENT_SCHEMA_DB]

    if (schemaDb && schemaDb instanceof Database) {
      return true
    }

    throw new Exception(
      Exception.GENERAL_BAD_REQUEST,
      'Only `document` type schemas allowed to access this route.',
    )
  }
}
