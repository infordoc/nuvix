
interface Collection {
  $collection: string;
  id: string;
  name: string;
  attributes: CollectionAttributes[];
  indexes: CollectionIndexes[];
}

interface CollectionAttributes {
  id: string;
  type: string;
  format: string;
  size: number;
  signed: boolean;
  required: boolean;
  default: null | string;
  array: boolean;
  filters: [];
}

interface CollectionIndexes {
  id: string;
  type: string;
  attributes: string[];
  lengths: number[];
  orders: string[];
}