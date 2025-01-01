import Permission, { PermissionType } from '../helper/permission.helper';
import { RoleType } from '../helper/role.helper';
import Roles from './roles.validator';

const PERMISSIONS = [PermissionType.Read, PermissionType.Create, PermissionType.Update, PermissionType.Delete, PermissionType.Write];

class Permissions extends Roles {
  constructor(length: number = 0, allowed: string[] = [...PERMISSIONS]) {
    super(length, allowed as RoleType[]);
  }

  public isValid(permissions: string[]): boolean {
    if (!Array.isArray(permissions)) {
      this.message = 'Permissions must be an array of strings.';
      return false;
    }

    if (this.length && permissions.length > this.length) {
      this.message = `You can only provide up to ${this.length} permissions.`;
      return false;
    }

    for (const permission of permissions) {
      if (typeof permission !== 'string') {
        this.message = 'Every permission must be of type string.';
        return false;
      }

      if (permission === '*') {
        this.message = 'Wildcard permission "*" has been replaced. Use "any" instead.';
        return false;
      }

      if (permission.startsWith('role:')) {
        this.message = 'Permissions using the "role:" prefix have been replaced. Use "users", "guests", or "any" instead.';
        return false;
      }

      if (!this.allowed.includes(permission as RoleType)) {
        this.message = `Permission "${permission}" is not allowed. Must be one of: ${this.allowed.join(', ')}.`;
        return false;
      }

      try {
        Permission.parse(permission);
      } catch (e) {
        this.message = e.message;
        return false;
      }
    }

    return true;
  }
}

export default Permissions;