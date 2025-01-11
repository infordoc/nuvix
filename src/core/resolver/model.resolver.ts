import { ClsService, ClsServiceManager } from "nestjs-cls";
import { Authorization } from "../validators/authorization.validator";
import { Input } from "../validators/authorization-input.validator";
import { Database } from "../config/database";
import { Exception } from "../extend/exception";
import { BaseDocument } from "src/base/schemas/base.schema";


export class ModelResolver<T extends BaseDocument> {
  private readonly document: T;
  private readonly cls: ClsService;

  constructor(document: T) {
    this.document = document;
    this.cls = ClsServiceManager.getClsService();
  }

  private isAuthorized(forAction: string = Database.PERMISSION_READ): boolean {
    const authorization = this.cls.get<Authorization>('authorization');
    if (!authorization) {
      throw new Exception(
        Exception.GENERAL_SERVICE_DISABLED,
        "Authorization service is not available."
      );
    }

    let input: Input | undefined;
    switch (forAction) {
      case Database.PERMISSION_READ:
        input = new Input(Database.PERMISSION_READ, this.document.getRead());
        break;
      case Database.PERMISSION_UPDATE:
        input = new Input(Database.PERMISSION_UPDATE, this.document.getUpdate());
        break;
      case Database.PERMISSION_DELETE:
        input = new Input(Database.PERMISSION_DELETE, this.document.getDelete());
        break;
      case Database.PERMISSION_CREATE:
        input = new Input(Database.PERMISSION_CREATE, this.document.getCreate());
        break;
      default:
        return false;
    }

    return authorization.isValid(input);
  }

  public getDocument(action: string = Database.PERMISSION_READ): T | undefined {
    if (!this.document) {
      if (action !== Database.PERMISSION_READ) {
        throw new Exception(Exception.GENERAL_NOT_FOUND, "Document not found.");
      } else return null;
    }

    const authorized = this.isAuthorized(action);
    if (this.document && authorized) {
      return this.document;
    }

    // if (!authorized && action !== Database.PERMISSION_READ) {
    //   throw new Exception(Exception.GENERAL_ACCESS_FORBIDDEN, "Access denied.");
    // }

    return undefined;
  }
}