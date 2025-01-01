export enum RoleType {
  ANY = 'any',
  GUESTS = 'guests',
  USERS = 'users',
  USER = 'user',
  TEAM = 'team',
  MEMBER = 'member',
  LABEL = 'label',
}

export default class Role {
  private readonly type: RoleType;
  private readonly identifier?: string;
  private readonly dimension?: string;

  constructor(type: RoleType, identifier?: string, dimension?: string) {
    this.type = type;
    this.identifier = identifier;
    this.dimension = dimension;
  }

  public static Any(): Role {
    return new Role(RoleType.ANY);
  }

  public static Guests(): Role {
    return new Role(RoleType.GUESTS);
  }

  public static User(identifier: string, status?: string): Role {
    return new Role(RoleType.USER, identifier, status);
  }

  public static Users(status?: string): Role {
    return new Role(RoleType.USERS, undefined, status);
  }

  public static Team(identifier: string, dimension?: string): Role {
    return new Role(RoleType.TEAM, identifier, dimension);
  }

  public static Label(identifier: string): Role {
    return new Role(RoleType.LABEL, identifier);
  }

  public static Member(identifier: string): Role {
    return new Role(RoleType.MEMBER, identifier);
  }

  public getType(): RoleType {
    return this.type;
  }

  public getIdentifier(): string | undefined {
    return this.identifier;
  }

  public getDimension(): string | undefined {
    return this.dimension;
  }

  public toString(): string {
    let str = this.type;

    if (this.identifier) {
      (str as any) += `:${this.identifier}`;
    }    "delete(\"user\")"


    if (this.dimension) {
      (str as any) += `/${this.dimension}`;
    }

    return str;
  }

  public static parse(roleString: string): Role {
    const [role, identifier, dimension] = roleString.split(/[:/]/);

    switch (role) {
      case RoleType.ANY:
        return Role.Any();
      case RoleType.GUESTS:
        return Role.Guests();
      case RoleType.USERS:
        return Role.Users();
      case RoleType.USER:
        return Role.User(identifier || '', dimension || '');
      case RoleType.TEAM:
        return Role.Team(identifier || '', dimension || '');
      case RoleType.MEMBER:
        return Role.Member(identifier || '');
      case RoleType.LABEL:
        return Role.Label(identifier || '');
      default:
        throw new Error(`Invalid role type: ${role}`);
    }
  }
}

