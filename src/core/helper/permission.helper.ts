import Role from "./role.helper";

export enum PermissionType {
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Write = 'write',
}

const AGGREGATES: Partial<Record<PermissionType, PermissionType[]>> = {
  [PermissionType.Write]: [
    PermissionType.Create,
    PermissionType.Update,
    PermissionType.Delete,
  ],
};

export default class Permission {
  private readonly permission: PermissionType;
  private readonly role: Role;

  constructor(
    permission: PermissionType,
    role: Role,
    identifier: string = '',
    dimension: string = ''
  ) {
    this.permission = permission;
    this.role = new Role(role.getType(), (role.getIdentifier() || identifier), (role.getDimension() || dimension));
  }

  public static Read(role: Role, identifier: string = '', dimension: string = ''): Permission {
    return new Permission(PermissionType.Read, role, identifier, dimension);
  }

  public static Create(role: Role, identifier: string = '', dimension: string = ''): Permission {
    return new Permission(PermissionType.Create, role, identifier, dimension);
  }

  public static Update(role: Role, identifier: string = '', dimension: string = ''): Permission {
    return new Permission(PermissionType.Update, role, identifier, dimension);
  }

  public static Delete(role: Role, identifier: string = '', dimension: string = ''): Permission {
    return new Permission(PermissionType.Delete, role, identifier, dimension);
  }

  public static Write(role: Role, identifier: string = '', dimension: string = ''): Permission {
    return new Permission(PermissionType.Write, role, identifier, dimension);
  }

  public getPermission(): PermissionType {
    return this.permission;
  }

  public getRole(): Role {
    return this.role;
  }

  public toString(): string {
    return `${this.permission}("${this.role.toString()}")`;
  }

  public static parse(permissionString: string): Permission {
    const match = permissionString.match(/^([a-z]+)\("([^"]+)"\)$/);

    if (!match) {
      throw new Error(`Invalid permission string format: "${permissionString}".`);
    }

    const permissionType = match[1] as PermissionType;
    const roleString = match[2];

    if (!Object.values(PermissionType).includes(permissionType)) {
      throw new Error(`Invalid permission type: "${permissionType}".`);
    }

    const role = Role.parse(roleString);

    return new Permission(permissionType, role);
  }

  public static aggregate(
    permissions: string[] | null,
    allowedPermissions: PermissionType[] = Object.values(PermissionType)
  ): string[] | null {
    if (!permissions) {
      return null;
    }

    const mutatedPermissions: string[] = [];

    for (const permissionString of permissions) {
      const permission = Permission.parse(permissionString);

      if (AGGREGATES[permission.permission]) {
        for (const subType of AGGREGATES[permission.permission]) {
          if (allowedPermissions.includes(subType)) {
            mutatedPermissions.push(
              new Permission(subType, permission.role).toString()
            );
          }
        }
      } else {
        mutatedPermissions.push(permissionString);
      }
    }

    return Array.from(new Set(mutatedPermissions));
  }
}