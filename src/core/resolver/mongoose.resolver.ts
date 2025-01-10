import { Schema } from 'mongoose';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { DynamicModule } from '@nestjs/common';
import { BaseSchema } from 'src/base/schemas/base.schema';

export function applyBaseModel(schema: Schema): Schema {
  schema.loadClass(BaseSchema);
  // Middleware to ensure `permissions` is included unless explicitly excluded
  schema.pre(['find', 'findOne'], function (this: any) {
    if (this._fields && !('permissions' in this._fields)) {
      this.select('permissions');
    }
  });
  return schema;
}

export class GlobalMongooseModule {
  static forFeature(models: { name: string; schema: any }[], connectionName?: string): DynamicModule {
    const extendedModels = models.map((model) => ({
      name: model.name,
      schema: applyBaseModel(model.schema),
    }));

    return MongooseModule.forFeature(extendedModels, connectionName);
  }
}