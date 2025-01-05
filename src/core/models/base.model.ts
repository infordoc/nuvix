import { Exclude, Expose } from "class-transformer";
import mongoose, { Document } from "mongoose";
import { dataToObject, DataToObjectOptions } from "../helper/model.helper";

@Exclude()
export default abstract class BaseModel {
  /**
 *  ID.
 */
  @Expose() $id: string;
  /**
   * User creation date in ISO 8601 format.
   */
  @Expose() $createdAt: Date;
  /**
   * User update date in ISO 8601 format.
   */
  @Expose() $updatedAt: Date;

  @Expose() $permissions: string[];

  @Exclude() _id: mongoose.Types.ObjectId | any;
  @Exclude() id: string;

  constructor(doc?: any, options?: DataToObjectOptions) {
    if (doc) {
      Object.assign(this, dataToObject(doc, options));
    }
  }
}


interface BaseListModelInterface<T> {
  fromDocuments(docs: Document[]): T[];
}

@Exclude()
export abstract class BaseListModel {
  @Expose() total: number;

  constructor() { }
}