import { Document } from "mongoose";

export interface DataToObjectOptions {
  flattenObj?: boolean;
  covertOption?: ConvertOptions;
}

export function dataToObject(data: Partial<Document | Document[] | { [key: string]: any }>, options: DataToObjectOptions = {}): any {
  const { flattenObj = false, covertOption = {} } = options;

  function processItem(item: any): any {
    let res = item instanceof Document ? item.toObject({ flattenObjectIds: true }) : item;
    return flattenObj ? convertSchemaToModel(res, covertOption) : res;
  }

  if (Array.isArray(data)) {
    return data.map(processItem);
  } else {
    return processItem(data);
  }
}

interface ConversionMap {
  [key: string]: string;
}

interface ConvertOptions {
  conversionMap?: ConversionMap;
  maxLevel?: number;
  removePluralAtLevel?: number;
}

export function convertSchemaToModel(doc: any, options: ConvertOptions = {}): any {
  const result: any = {};
  const {
    conversionMap = {},
    maxLevel = Infinity,
    removePluralAtLevel = Infinity,
  } = options;

  function toCamelCase(str: string): string {
    return str.replace(/\.([a-zA-Z0-9])/g, (match, group1) => group1.toUpperCase());
  }

  function removeTrailingS(str: string): string {
    return str.replace(/s$/, '');
  }

  function flattenObject(obj: any, parentKey: string = '', level: number = 1) {
    if (level > maxLevel) return;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        let newKey = parentKey ? `${parentKey}.${key}` : key;

        if (level === removePluralAtLevel) {
          newKey = removeTrailingS(newKey);
        }

        const mappedKey = conversionMap[newKey] || toCamelCase(newKey);

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          flattenObject(obj[key], newKey, level + 1);
        } else {
          result[mappedKey] = obj[key];
        }
      }
    }
  }

  flattenObject(doc);
  return result;
}
