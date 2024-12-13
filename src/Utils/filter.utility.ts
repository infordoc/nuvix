import { BaseArgs, BaseFilter } from 'src/base/objects/base.object';
import { Brackets, NotBrackets, SelectQueryBuilder, WhereExpressionBuilder } from 'typeorm';

class QueryBuilderError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    this.name = 'QueryBuilderError';
  }
}

function validateValue(operator: string, value: any): void {
  if (['lt', 'lte', 'gt', 'gte'].includes(operator) && typeof value !== 'number') {
    throw new QueryBuilderError(400, `Invalid value for operator '${operator}'. Expected a number.`);
  }

  if (['in', 'notIn'].includes(operator) && !Array.isArray(value)) {
    throw new QueryBuilderError(400, `Invalid value for operator '${operator}'. Expected an array.`);
  }

  if (operator === 'between' && (!Array.isArray(value) || value.length !== 2)) {
    throw new QueryBuilderError(400, `Invalid value for operator 'between'. Expected an array with two elements.`);
  }

  if (['and', 'or'].includes(operator) && !Array.isArray(value)) {
    throw new QueryBuilderError(400, `Invalid value for operator '${operator}'. Expected an array of conditions.`);
  }

  if (typeof value === 'undefined' || value === null) {
    throw new QueryBuilderError(400, `Value for operator '${operator}' cannot be null or undefined.`);
  }
}

function applyFilters<T>(queryBuilder: SelectQueryBuilder<T>, filters: BaseFilter | any, paramIndex = 0): SelectQueryBuilder<T> {
  Object.keys(filters).forEach(field => {
    const fieldFilters = filters[field];
    if (fieldFilters) {
      switch (field) {
        case 'and':
          if (Array.isArray(fieldFilters)) {
            queryBuilder.andWhere(new Brackets(qb => {
              fieldFilters.forEach((subFilter: BaseFilter | any, index: number) => {
                applyFilters(qb as any, subFilter, paramIndex + index + 1);
              });
            }));
          }
          break;
        case 'or':
          if (Array.isArray(fieldFilters)) {
            queryBuilder.orWhere(new Brackets(qb => {
              fieldFilters.forEach((subFilter: BaseFilter | any, index: number) => {
                if (index === 0) {
                  applyFilters(qb as any, subFilter, paramIndex + index + 1);
                } else {
                  qb.orWhere(new Brackets(subQb => {
                    applyFilters(subQb as any, subFilter, paramIndex + index + 1);
                  }));
                }
              });
            }));
          }
          break;
        case 'not':
          queryBuilder.andWhere(new NotBrackets(qb => {
            applyFilters(qb as any, fieldFilters, paramIndex + 1);
          }));
          break;
        default:
          Object.keys(fieldFilters).forEach(operator => {
            const value = fieldFilters[operator];
            validateValue(operator, value);

            const paramName = `${field}_${operator}_${paramIndex}`;
            try {
              switch (operator) {
                case 'eq':
                  queryBuilder.andWhere(`${field} = :${paramName}`, { [paramName]: value });
                  break;
                case 'ne':
                  queryBuilder.andWhere(`${field} != :${paramName}`, { [paramName]: value });
                  break;
                case 'lt':
                  queryBuilder.andWhere(`${field} < :${paramName}`, { [paramName]: value });
                  break;
                case 'lte':
                  queryBuilder.andWhere(`${field} <= :${paramName}`, { [paramName]: value });
                  break;
                case 'gt':
                  queryBuilder.andWhere(`${field} > :${paramName}`, { [paramName]: value });
                  break;
                case 'gte':
                  queryBuilder.andWhere(`${field} >= :${paramName}`, { [paramName]: value });
                  break;
                case 'in':
                  queryBuilder.andWhere(`${field} IN (:...${paramName})`, { [paramName]: value });
                  break;
                case 'notIn':
                  queryBuilder.andWhere(`${field} NOT IN (:...${paramName})`, { [paramName]: value });
                  break;
                case 'contains':
                  queryBuilder.andWhere(`${field} LIKE :${paramName}`, { [paramName]: `%${value}%` });
                  break;
                case 'notContains':
                  queryBuilder.andWhere(`${field} NOT LIKE :${paramName}`, { [paramName]: `%${value}%` });
                  break;
                case 'startsWith':
                  queryBuilder.andWhere(`${field} LIKE :${paramName}`, { [paramName]: `${value}%` });
                  break;
                case 'endsWith':
                  queryBuilder.andWhere(`${field} LIKE :${paramName}`, { [paramName]: `%${value}` });
                  break;
                case 'between':
                  queryBuilder.andWhere(`${field} BETWEEN :${paramName}_start AND :${paramName}_end`, {
                    [`${paramName}_start`]: value[0],
                    [`${paramName}_end`]: value[1],
                  });
                  break;
                default:
                  throw new QueryBuilderError(400, `Unsupported operator '${operator}' for field '${field}'.`);
              }
            } catch (error) {
              throw new QueryBuilderError(500, `Error applying filter '${field}.${operator}': ${error.message}`);
            }
          });
          break;
      }
    }
  });
  return queryBuilder;
}

export function buildQuery<T>(queryBuilder: SelectQueryBuilder<T>, args: BaseArgs | any): SelectQueryBuilder<T> {
  try {
    if (args.filter) {
      applyFilters(queryBuilder, args.filter);
    }

    if (args.sort) {
      args.sort.forEach(sortField => {
        const [field, order] = sortField.split(':');
        if (!['asc', 'desc'].includes(order.toLowerCase())) {
          throw new QueryBuilderError(400, `Invalid sort order '${order}' for field '${field}'. Use 'asc' or 'desc'.`);
        }
        queryBuilder.addOrderBy(field, order.toUpperCase() as 'ASC' | 'DESC');
      });
    }

    if (args.pagination) {
      const { page, pageSize } = args.pagination;
      if (page < 1 || pageSize < 1) {
        throw new QueryBuilderError(400, `Invalid pagination values. 'page' and 'pageSize' must be greater than 0.`);
      }
      queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    }
  } catch (error) {
    if (error instanceof QueryBuilderError) {
      console.error(`Query Error: ${error.message}`);
      throw error;
    } else {
      console.error('Unexpected error:', error);
      throw new QueryBuilderError(500, 'An unexpected error occurred while building the query.');
    }
  }

  return queryBuilder;
}
