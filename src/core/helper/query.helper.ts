import { Repository, SelectQueryBuilder } from 'typeorm';
import { Exception } from 'src/core/extend/exception';

interface QueryOptions {
  method: string;
  attribute?: string;
  values: any[];
}

export class QueryBuilder<T> {
  private repository: Repository<T>;
  private queryBuilder: SelectQueryBuilder<T>;
  private options: any = { limit: 25, skip: 0 }; // Default options

  static readonly OPTIONAL_ATTRIBUTES = [
    'limit',
    'orgId',
    'id',
    'updatedAt',
    'cursorAfter',
    'cursorBefore',
    'offset',
    'orderAsc',
    'orderDesc',
  ];

  private ALLOWED_ATTRIBUTES = [
    '$id',
    '$createdAt',
    '$updatedAt',
  ];

  constructor(repository: Repository<T>, allowedAttributes: string[] = []) {
    this.repository = repository;
    this.queryBuilder = repository.createQueryBuilder();
    this.ALLOWED_ATTRIBUTES.push(...allowedAttributes);
  }

  // Set allowed attributes for validation
  validateAttribute(attribute: string) {
    if (!this.ALLOWED_ATTRIBUTES.includes(attribute)) {
      throw new Error(`Invalid attribute: ${attribute}. Allowed attributes are: ${this.ALLOWED_ATTRIBUTES.join(', ')}`);
    }
  }

  validateQuery(query: QueryOptions) {
    const { method, attribute, values } = query;

    if (attribute && !QueryBuilder.OPTIONAL_ATTRIBUTES.includes(attribute)) this.validateAttribute(attribute);

    switch (method) {
      case 'equal':
      case 'notEqual':
      case 'lessThan':
      case 'greaterThan':
      case 'greaterThanEqual':
      case 'lessThanEqual':
      case 'contains':
      case 'isNull':
      case 'isNotNull':
      case 'between':
      case 'startsWith':
      case 'endsWith':
        if (!attribute || !values) {
          throw new Exception(Exception.GENERAL_QUERY_INVALID, 'Invalid query format');
        }
        break;
      case 'limit':
      case 'offset':
        if (!values) {
          throw new Exception(Exception.GENERAL_QUERY_INVALID, 'Invalid query format');
        }
        break;
      case 'orderAsc':
      case 'orderDesc':
        if (attribute === undefined) {
          throw new Exception(Exception.GENERAL_QUERY_INVALID, 'Invalid query format');
        }
        break;
      case 'and':
      case 'or':
        if (!values) {
          throw new Exception(Exception.GENERAL_QUERY_INVALID, 'Invalid query format');
        }
        break;
      default:
        throw new Exception(Exception.GENERAL_QUERY_INVALID, `Unknown query method: ${method}`);
    }
  }

  parseQueryStrings(queryStrings?: string[]): void {
    const queries: QueryOptions[] = [];

    queryStrings?.forEach(queryString => {
      try {
        // Decode the query string
        const decodedQuery = decodeURIComponent(queryString);

        // Parse the JSON query
        const parsedQuery = JSON.parse(decodedQuery);

        // Validate the query
        this.validateQuery(parsedQuery);

        // Convert special attributes
        if (parsedQuery.attribute) {
          if (parsedQuery.attribute === '$id') parsedQuery.attribute = '_id';
          if (parsedQuery.attribute === '$updatedAt') parsedQuery.attribute = 'updated_at';
          if (parsedQuery.attribute === '$createdAt') parsedQuery.attribute = 'created_at';
        }

        queries.push(parsedQuery);
      } catch (error) {
        // Throw a more informative error
        throw new Exception(Exception.GENERAL_QUERY_INVALID, `Error parsing query string: ${error.message}`);
      }
    });

    // Parse the validated queries
    this.parseQueries(queries);
  }

  parseQueries(queries?: QueryOptions[], validate = false): void {
    queries?.forEach(query => {
      const { method, attribute, values } = query;

      if (validate) this.validateQuery(query);

      switch (method) {
        case 'equal':
          this.queryBuilder.andWhere(`${attribute} IN (:...values)`, { values });
          break;
        case 'notEqual':
          this.queryBuilder.andWhere(`${attribute} NOT IN (:...values)`, { values });
          break;
        case 'lessThan':
          this.queryBuilder.andWhere(`${attribute} < :value`, { value: values[0] });
          break;
        case 'lessThanEqual':
          this.queryBuilder.andWhere(`${attribute} <= :value`, { value: values[0] });
          break;
        case 'greaterThan':
          this.queryBuilder.andWhere(`${attribute} > :value`, { value: values[0] });
          break;
        case 'greaterThanEqual':
          this.queryBuilder.andWhere(`${attribute} >= :value`, { value: values[0] });
          break;
        case 'contains':
          this.queryBuilder.andWhere(`${attribute} LIKE :value`, { value: `%${values[0]}%` });
          break;
        case 'isNull':
          this.queryBuilder.andWhere(`${attribute} IS NULL`);
          break;
        case 'isNotNull':
          this.queryBuilder.andWhere(`${attribute} IS NOT NULL`);
          break;
        case 'between':
          this.queryBuilder.andWhere(`${attribute} BETWEEN :start AND :end`, { start: values[0], end: values[1] });
          break;
        case 'startsWith':
          this.queryBuilder.andWhere(`${attribute} LIKE :value`, { value: `${values[0]}%` });
          break;
        case 'endsWith':
          this.queryBuilder.andWhere(`${attribute} LIKE :value`, { value: `%${values[0]}` });
          break;
        case 'limit':
          this.options.limit = values[0];
          break;
        case 'offset':
          this.options.skip = values[0];
          break;
        case 'orderAsc':
          this.queryBuilder.orderBy(attribute, 'ASC');
          break;
        case 'orderDesc':
          this.queryBuilder.orderBy(attribute, 'DESC');
          break;
        case 'and':
          this.handleLogicalOperator('and', values);
          break;
        case 'or':
          this.handleLogicalOperator('or', values);
          break;
        default:
          throw new Error(`Unknown query method: ${method}`);
      }
    });
  }

  // Handle logical operators
  private handleLogicalOperator(operator: 'and' | 'or', queries: QueryOptions[]) {
    const combinedQueries = queries.map(q => {
      const { method, attribute, values } = q;
      if (attribute && !QueryBuilder.OPTIONAL_ATTRIBUTES.includes(attribute)) this.validateAttribute(attribute);
      switch (method) {
        case 'equal':
          return `${attribute} IN (:...values)`;
        case 'notEqual':
          return `${attribute} NOT IN (:...values)`;
        case 'lessThan':
          return `${attribute} < :value`;
        case 'greaterThan':
          return `${attribute} > :value`;
        case 'greaterThanEqual':
          return `${attribute} >= :value`;
        case 'lessThanEqual':
          return `${attribute} <= :value`;
        case 'contains':
          return `${attribute} LIKE :value`;
        case 'isNull':
          return `${attribute} IS NULL`;
        case 'isNotNull':
          return `${attribute} IS NOT NULL`;
        case 'between':
          return `${attribute} BETWEEN :start AND :end`;
        case 'startsWith':
          return `${attribute} LIKE :value`;
        case 'endsWith':
          return `${attribute} LIKE :value`;
        default:
          throw new Error(`Unknown query method in logical operator: ${method}`);
      }
    });

    const condition = operator === 'and' ? 'AND' : 'OR';
    this.queryBuilder.andWhere(`(${combinedQueries.join(` ${condition} `)})`, queries.reduce((params, q) => {
      const { values } = q;
      return { ...params, values: [...(params.values || []), ...values] };
    }, {}));
  }

  addSearchFilter(search: string): void {
    this.queryBuilder.andWhere(`search LIKE :search`, { search: `%${search}%` });
  }

  async execute(auth = true) {
    const [results, totalCount] = await this.queryBuilder
      .skip(this.options.skip)
      .take(this.options.limit)
      .getManyAndCount();

    return {
      results,
      totalCount,
      limit: this.options.limit,
      skip: this.options.skip,
    };
  }
}