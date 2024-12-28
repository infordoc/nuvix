import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DatabaseDocument = HydratedDocument<Database>;

/**
 * Represents a database schema with necessary properties.
 *
 * @schema Database
 * @property {string} id - The unique identifier for the database.
 * @property {string} internalId - The internal identifier for the database.
 * @property {string} name - The name of the database.
 * @property {string} projectId - The identifier of the project associated with the database.
 * @timestamps true - Indicates that timestamps are enabled for this schema.
 */
@Schema({ timestamps: true })
export class Database {
  @Prop({ required: true, type: String, unique: true })
  id: string;

  @Prop({ required: true, type: String })
  internalId: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  projectId: string;
}

/**
 * Represents the attributes of a collection in the schema.
 *
 * @schema
 * @id CollectionAttribute
 *
 * @property {string} id - The unique identifier for the collection attribute. This field is required.
 * @property {string} type - The type of the collection attribute. This field is required.
 * @property {string} format - The format of the collection attribute. This field is required.
 * @property {number} size - The size of the collection attribute. This field is required.
 * @property {boolean} signed - Indicates whether the collection attribute is signed. This field is required.
 * @property {boolean} required - Indicates whether the collection attribute is required. This field is required.
 * @property {string | null} [default=null] - The default value of the collection attribute. Defaults to null.
 * @property {boolean} array - Indicates whether the collection attribute is an array. This field is required.
 * @property {string[]} [filters=[]] - An array of filters applied to the collection attribute. Defaults to an empty array.
 */
@Schema({ _id: false })
export class CollectionAttribute {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  type: string;

  @Prop({ required: true, type: String })
  format: string;

  @Prop({ required: true, type: Number })
  size: number;

  @Prop({ required: true, type: Boolean })
  signed: boolean;

  @Prop({ required: true, type: Boolean })
  required: boolean;

  @Prop({ default: null, type: String })
  default: string | null;

  @Prop({ required: true, type: Boolean })
  array: boolean;

  @Prop({ type: [String], default: [] })
  filters: string[];
}

/**
 * Represents the schema for collection indexes.
 *
 * @schema CollectionIndexes
 * @property {string} id - The unique identifier for the collection index.
 * @property {string} type - The type of the collection index.
 * @property {string[]} attributes - The attributes associated with the collection index.
 * @property {number[]} lengths - The lengths of the attributes.
 * @property {string[]} orders - The order of the attributes.
 */
@Schema({ _id: false })
export class CollectionIndexes {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  type: string;

  @Prop({ type: [String], required: true })
  attributes: string[];

  @Prop({ type: [Number], required: true })
  lengths: number[];

  @Prop({ type: [String], required: true })
  orders: string[];
}

export const CollectionAttributeSchema =
  SchemaFactory.createForClass(CollectionAttribute);
export const CollectionIndexesSchema =
  SchemaFactory.createForClass(CollectionIndexes);

/**
 * Represents a collection schema for the database.
 *
 * @schema Collection
 * @decorator `@Schema({ timestamps: true })`
 */
export class Collection {
  /**
   * The unique identifier for the collection.
   *
   * @prop
   * @required
   */
  @Prop({ required: true, type: String })
  id: string;

  /**
   * The name of the collection.
   *
   * @prop
   * @required
   */
  @Prop({ required: true, type: String })
  name: string;

  /**
   * The identifier of the database to which the collection belongs.
   *
   * @prop
   * @required
   */
  @Prop({ required: true, type: String })
  databaseId: string;

  /**
   * Indicates whether the collection is active.
   *
   * @prop
   * @required
   * @default true
   */
  @Prop({ required: true, default: true, type: Boolean })
  isActive: boolean;

  /**
   * Indicates whether the documents in the collection are secured.
   *
   * @prop
   * @required
   * @default false
   */
  @Prop({ required: true, default: false, type: Boolean })
  documentSecured: boolean;

  /**
   * The attributes of the collection.
   *
   * @prop
   * @type {CollectionAttribute[]}
   */
  @Prop({ type: [CollectionAttributeSchema] })
  attributes: CollectionAttribute[];

  /**
   * The indexes of the collection.
   *
   * @prop
   * @type {CollectionIndexes[]}
   */
  @Prop({ type: [CollectionIndexesSchema] })
  indexes: CollectionIndexes[];
}

export const DatabaseSchema = SchemaFactory.createForClass(Database);
export const CollectionSchema = SchemaFactory.createForClass(Collection);

type CollectionDocumentOverride = {
  attributes: Types.DocumentArray<CollectionAttribute>;
  indexes: Types.DocumentArray<CollectionIndexes>;
};

export type CollectionDocument = HydratedDocument<
  Collection,
  CollectionDocumentOverride
>;
