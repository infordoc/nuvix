import { DataSource } from '@nuvix/pg';
import { Logger } from '@nestjs/common';
import { Exception } from '@nuvix/core/extend/exception';
import type {
  Expression,
  Condition,
  NotExpression,
  OrExpression,
  AndExpression,
  ColumnNode,
  EmbedNode,
  SelectNode,
  ParsedOrdering,
  ValueType,
  ParserResult,
} from './types';
import { PG } from '@nuvix/pg';
import { JoinBuilder } from './join-builder';
import { ParserError } from './error';

type QueryBuilder = ReturnType<DataSource['queryBuilder']>;

export interface ASTToQueryBuilderOptions {
  applyExtra?: boolean;
  tableName?: string;
  baseQuery?: QueryBuilder;
  allowUnsafeOperators?: boolean;
  maxNestingDepth?: number;
}

export class ASTToQueryBuilder<T extends QueryBuilder> {
  private readonly logger = new Logger(ASTToQueryBuilder.name);
  public qb: T;
  public pg: DataSource;
  private nestingDepth = 0;
  private readonly maxNestingDepth: number;
  private readonly allowUnsafeOperators: boolean;
  private allowedSchemas: string[] = [];
  private anyAllsupportedOperators = [
    'eq',
    'like',
    'ilike',
    'gt',
    'gte',
    'lt',
    'lte',
    'match',
    'imatch',
  ];

  constructor(qb: T, pg: DataSource, options: ASTToQueryBuilderOptions = {}) {
    this.qb = qb;
    this.pg = pg;
    this.maxNestingDepth = options.maxNestingDepth || 10;
    this.allowUnsafeOperators = options.allowUnsafeOperators || false;
  }

  /**
   *apply AST expression to QueryBuilder conditions
   */
  applyFilters(
    expression?: Expression & ParserResult,
    options: ASTToQueryBuilderOptions = {},
  ): QueryBuilder {
    if (!expression) {
      return this.qb;
    }

    try {
      this.nestingDepth = 0;
      if (options.applyExtra) {
        const { limit, offset, group } = expression;
        this.applyLimitOffset({
          limit,
          offset,
        });
        this.applyGroupBy(group, options.tableName);
      }
      return this._convertExpression(expression, this.qb);
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new Error('Unknown query builder conversion error');
    }
  }

  /**
   *apply select nodes to QueryBuilder select clauses
   */
  applySelect(selectNodes: SelectNode[], queryBuilder = this.qb): QueryBuilder {
    if (!selectNodes || selectNodes.length === 0) {
      return queryBuilder;
    }

    const selectColumns: any[] = [];
    const embeds: EmbedNode[] = [];

    selectNodes.forEach(node => {
      if (node.type === 'column') {
        selectColumns.push(this._buildColumnSelect(node));
      } else if (node.type === 'embed') {
        embeds.push(node);
      }
    });

    // Add column selections
    if (selectColumns.length > 0) {
      queryBuilder.select(selectColumns);
    }

    // Handle embeds (subqueries/joins)
    embeds.forEach(embed => {
      this._handleEmbedNode(embed);
    });

    return queryBuilder;
  }

  /**
   *apply ordering to QueryBuilder order clauses
   */
  applyOrder(orderings: ParsedOrdering[], table: string): T {
    if (!orderings || orderings.length === 0) {
      return this.qb;
    }

    orderings.forEach(ordering => {
      const { path, direction, nulls } = ordering;

      if (nulls) {
        // Handle NULLS FIRST/LAST
        const nullsClause =
          nulls === 'nullsfirst' ? 'NULLS FIRST' : 'NULLS LAST';
        this.qb.orderByRaw(`?? ${direction.toUpperCase()} ${nullsClause}`, [
          path,
        ]);
      } else {
        this.qb.orderByRaw(`?? ${direction.toUpperCase()}`, [
          this._rawField(path, table),
        ]);
      }
    });

    return this.qb;
  }

  /**
   * Apply GROUP BY clauses to the QueryBuilder
   */
  applyGroupBy(columns?: Condition['field'][], tableName?: string) {
    if (columns && columns.length) {
      const _columns = columns.map(
        column => this._rawField(column, tableName).toSQL().sql,
      );
      this.qb.groupByRaw(_columns.join(', '));
    }
    return this.qb;
  }

  /**
   * Apply LIMIT and OFFSET to the QueryBuilder
   */
  applyLimitOffset({
    limit,
    offset,
  }: {
    limit?: number | string;
    offset?: number | string;
  }) {
    limit =
      typeof limit === 'number'
        ? limit
        : typeof limit === 'string'
          ? Number(limit)
          : undefined;
    offset =
      typeof offset === 'number'
        ? offset
        : typeof offset === 'string'
          ? Number(offset)
          : undefined;

    if (Number.isInteger(limit)) this.qb.limit(limit);
    if (Number.isInteger(offset)) this.qb.limit(offset);

    return this.qb;
  }

  /**
   * Apply returning select nodes to QueryBuilder
   */
  applyReturning(
    selectNodes: SelectNode[],
    queryBuilder = this.qb,
  ): QueryBuilder {
    if (!selectNodes || selectNodes.length === 0) {
      queryBuilder.returning('*');
      return queryBuilder;
    }

    const selectColumns: any[] = [];

    selectNodes.forEach(node => {
      if (node.type === 'column') {
        selectColumns.push(this._buildColumnSelect(node));
      } else if (node.type === 'embed') {
        // TODO: throw or skip
      }
    });

    // Add column selections
    if (selectColumns.length > 0) {
      queryBuilder.returning(selectColumns);
    } else {
      // If no specific columns are selected, return all columns
      queryBuilder.returning('*');
    }

    return queryBuilder;
  }

  private _convertExpression(
    expression: Expression,
    queryBuilder: QueryBuilder,
  ): QueryBuilder {
    if (!expression) {
      return queryBuilder;
    }

    // Check nesting depth to prevent stack overflow
    if (this.nestingDepth > this.maxNestingDepth) {
      throw new Error(
        `Maximum nesting depth of ${this.maxNestingDepth} exceeded`,
      );
    }

    this.nestingDepth++;

    try {
      if (ASTToQueryBuilder._isCondition(expression)) {
        return this._applyCondition(expression, queryBuilder);
      }

      if (ASTToQueryBuilder._isNotExpression(expression)) {
        return this._applyNotExpression(expression, queryBuilder);
      }

      if (ASTToQueryBuilder._isOrExpression(expression)) {
        return this._applyOrExpression(expression, queryBuilder);
      }

      if (ASTToQueryBuilder._isAndExpression(expression)) {
        return this._applyAndExpression(expression, queryBuilder);
      }

      throw new Error(`Unknown expression type: ${JSON.stringify(expression)}`);
    } finally {
      this.nestingDepth--;
    }
  }

  private _applyCondition(
    condition: Condition,
    queryBuilder: QueryBuilder,
  ): QueryBuilder {
    const {
      field: _field,
      operator,
      values = [],
      tableName,
    } = condition;

    if (!_field || !operator) {
      throw new Error('Condition must have both field and operator');
    }

    const field = this._rawField(_field, tableName) as unknown as ReturnType<PG['raw']>;

    // ANY/ALL modifiers
    if (
      Array.isArray(values) &&
      values.length >= 2 &&
      this.anyAllsupportedOperators.includes(operator)
    ) {
      const [modifier, ...restValues] = values;
      if (modifier === 'any' || modifier === 'all') {
        return this._applyAnyAllCondition(field, operator, modifier, restValues, queryBuilder);
      }
    }

    const value = values[0];
    const filteredValues = values.filter(v => !this._isValueColumnName(v));
    const right = this._valueTypeToPlaceholder(values);

    switch (operator) {
      case 'eq': return queryBuilder.whereRaw(`?? = ${right}`, [field, value]);
      case 'gt': return queryBuilder.whereRaw(`?? > ${right}`, [field, value]);
      case 'gte': return queryBuilder.whereRaw(`?? >= ${right}`, [field, value]);
      case 'lt': return queryBuilder.whereRaw(`?? < ${right}`, [field, value]);
      case 'lte': return queryBuilder.whereRaw(`?? <= ${right}`, [field, value]);
      case 'neq': return queryBuilder.whereRaw(`?? <> ${right}`, [field, value]);
      case 'like': return queryBuilder.whereRaw(`?? LIKE ${right}`, [field, value]);
      case 'ilike': return queryBuilder.whereRaw(`?? ILIKE ${right}`, [field, value]);
      case 'match': return queryBuilder.whereRaw(`?? ~ ${right}`, [field, value]);
      case 'imatch': return queryBuilder.whereRaw(`?? ~* ${right}`, [field, value]);
      case 'in': return queryBuilder.whereRaw(`?? IN (?)`, [field, filteredValues]);
      case 'notin': return queryBuilder.whereRaw(`?? NOT IN (?)`, [field, filteredValues]);

      case 'is':
      case 'isnot':
        switch (String(value)) {
          case 'null': return queryBuilder.whereRaw(`?? IS NULL`, [field]);
          case 'not_null': return queryBuilder.whereRaw(`?? IS NOT NULL`, [field]);
          case 'true': return queryBuilder.whereRaw(`?? IS TRUE`, [field]);
          case 'false': return queryBuilder.whereRaw(`?? IS FALSE`, [field]);
          case 'unknown': return queryBuilder.whereRaw(`?? IS UNKNOWN`, [field]);
          default: throw new Error(`Unsupported IS condition: ${value}`);
        }

      case 'null': return queryBuilder.whereRaw(`?? IS NULL`, [field]);
      case 'notnull': return queryBuilder.whereRaw(`?? IS NOT NULL`, [field]);
      case 'isdistinct': return queryBuilder.whereRaw(`?? IS DISTINCT FROM ${right}`, [field, value]);

      // Full-text search
      case 'fts': return this._applyFts(field, values, 'to_tsquery', queryBuilder);
      case 'plfts': return this._applyFts(field, values, 'plainto_tsquery', queryBuilder);
      case 'phfts': return this._applyFts(field, values, 'phraseto_tsquery', queryBuilder);
      case 'wfts': return this._applyFts(field, values, 'websearch_to_tsquery', queryBuilder);

      // Array/JSON
      case 'cs': return queryBuilder.whereRaw(`?? @> ?`, [field, JSON.stringify(values)]);
      case 'cd': return queryBuilder.whereRaw(`?? <@ ?`, [field, JSON.stringify(values)]);
      case 'ov': return queryBuilder.whereRaw(`?? && ?`, [field, JSON.stringify(values)]);

      // Range
      case 'sl': return queryBuilder.whereRaw(`?? << ?`, [field, filteredValues]);
      case 'sr': return queryBuilder.whereRaw(`?? >> ?`, [field, filteredValues]);
      case 'nxl': return queryBuilder.whereRaw(`?? &> ?`, [field, filteredValues]);
      case 'nxr': return queryBuilder.whereRaw(`?? &< ?`, [field, filteredValues]);
      case 'adj': return queryBuilder.whereRaw(`?? -|- ?`, [field, filteredValues]);

      // Modifiers
      case 'all': return queryBuilder.whereRaw(`?? = ALL(?)`, [field, filteredValues]);
      case 'any': return queryBuilder.whereRaw(`?? = ANY(?)`, [field, filteredValues]);

      case 'between':
        if (values.length !== 2) {
          throw new Error(`'between' operator expects exactly two values.`);
        }
        return queryBuilder.whereRaw(`?? BETWEEN ? AND ?`, [field, values[0], values[1]]);

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private _applyFts(
    field: ReturnType<PG['raw']>,
    values: any[],
    tsFunction: 'to_tsquery' | 'plainto_tsquery' | 'phraseto_tsquery' | 'websearch_to_tsquery',
    queryBuilder: QueryBuilder
  ): QueryBuilder {
    if (values.length >= 2) {
      const [language, query] = values;
      return queryBuilder.whereRaw(`to_tsvector(?, ??) @@ ${tsFunction}(?, ?)`, [language, field, language, query]);
    } else {
      return queryBuilder.whereRaw(`to_tsvector(??) @@ ${tsFunction}(?)`, [field, values[0]]);
    }
  }


  private _isValueColumnName(value: Condition['values'][number]): value is ValueType {
    if (
      value !== null &&
      typeof value === 'object' &&
      '__type' in value &&
      value.__type === 'column'
    )
      return true;
    else false;
  }

  private _valueTypeToPlaceholder(values: Condition['values']): '?' | '??' {
    if (this._isValueColumnName(values[0])) {
      return '??';
    } else {
      return '?';
    }
  }

  public _rawField(
    _field: Condition['field'],
    table: string,
  ): ReturnType<(typeof this.pg)['raw']> {
    if (typeof _field === 'string') {
      return this.pg.raw('??.??', [table, _field]);
    } else if (Array.isArray(_field)) {
      // Handle complex field paths with JSON operators
      const sqlParts: string[] = [];
      const bindings: any[] = [];

      for (let i = 0; i < _field.length; i++) {
        const part = _field[i];
        const isLastPart = i === _field.length - 1;
        const hasObjectPartsBefore = _field
          .slice(0, i)
          .some(p => typeof p === 'object' && 'operator' in p);

        if (typeof part === 'string') {
          const isAfterOperator =
            i > 0 &&
            _field
              .slice(0, i)
              .some(p => typeof p === 'object' && 'operator' in p);

          if (isAfterOperator) {
            // Try to convert to number if possible
            const numericValue = Number(part);
            if (!isNaN(numericValue) && isFinite(numericValue)) {
              sqlParts.push(part);
            } else {
              sqlParts.push(`'${part}'`);
            }
          } else {
            sqlParts.push(`"${part}"`);
          }

          // Add dot separator only if not last part
          if (!isLastPart) {
            sqlParts.push('.');
          }
        } else if (typeof part === 'object' && 'operator' in part) {
          // Handle JSON operators (->, ->>)
          if (isLastPart)
            throw new Error(
              'Invalid syntax, should be string after `->` or `->>`',
            ); // TODO: $error
          if (!hasObjectPartsBefore) {
            sqlParts.push(`"${part.name}"`);
          } else {
            // Try to convert to number if possible when i > 0
            const numericValue = Number(part.name);
            if (!isNaN(numericValue) && isFinite(numericValue)) {
              sqlParts.push(part.name);
            } else {
              sqlParts.push(`'${part.name}'`);
            }
          }
          sqlParts.push(part.operator);
        }
      }

      return this.pg.raw(sqlParts.join(''), bindings);
    } else {
      throw new Error('Invalid field type: field must be string or array');
    }
  }

  private _applyNotExpression(
    notExpression: NotExpression,
    queryBuilder: QueryBuilder,
  ): QueryBuilder {
    return queryBuilder.whereNot(builder => {
      this._convertExpression(notExpression.not, builder);
    });
  }

  private _applyOrExpression(
    orExpression: OrExpression,
    queryBuilder: QueryBuilder,
  ): QueryBuilder {
    if (!orExpression.or || orExpression.or.length === 0) {
      return queryBuilder;
    }

    return queryBuilder.where(builder => {
      orExpression.or.forEach((expr, index) => {
        if (index === 0) {
          this._convertExpression(expr, builder);
        } else {
          builder.orWhere(subBuilder => {
            this._convertExpression(expr, subBuilder);
          });
        }
      });
    });
  }

  private _applyAndExpression(
    andExpression: AndExpression,
    queryBuilder: QueryBuilder,
  ): QueryBuilder {
    if (!andExpression.and || andExpression.and.length === 0) {
      return queryBuilder;
    }

    andExpression.and.forEach(expr => {
      this._convertExpression(expr, queryBuilder);
    });

    return queryBuilder;
  }

  private _isKnownOperator(operator: string): boolean {
    const knownOperators = [
      // Basic comparisons
      'eq',
      'gt',
      'gte',
      'lt',
      'lte',
      'neq',
      'ne',
      // Pattern matching
      'like',
      'ilike',
      'match',
      'imatch',
      // List operations
      'in',
      'is',
      'isdistinct',
      // Full-text search
      'fts',
      'plfts',
      'phfts',
      'wfts',
      // Array/JSON operations
      'cs',
      'cd',
      'ov',
      // Range operations
      'sl',
      'sr',
      'nxr',
      'nxl',
      'adj',
      // Logical operators
      'not',
      'or',
      'and',
      // Legacy operators
      'between',
      'regex',
      'iregex',
      'not_regex',
      'not_iregex',
    ];
    return knownOperators.includes(operator);
  }

  /**
   * Handle ANY/ALL conditions for specific operators
   * Creates OR conditions for 'any' and AND conditions for 'all'
   */
  private _applyAnyAllCondition(
    field: ReturnType<PG['raw']>,
    operator: string,
    modifier: 'any' | 'all',
    operatorValues: any[],
    queryBuilder: QueryBuilder,
  ): QueryBuilder {
    modifier = modifier.toUpperCase() as typeof modifier;
    switch (operator) {
      case 'eq':
        return queryBuilder.whereRaw(`?? = ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      case 'like':
        return queryBuilder.whereRaw(`?? LIKE ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      case 'ilike':
        return queryBuilder.whereRaw(`?? ILIKE ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      case 'gt':
        return queryBuilder.whereRaw(`?? > ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      case 'gte':
        return queryBuilder.whereRaw(`?? >= ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      case 'lt':
        return queryBuilder.whereRaw(`?? < ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      case 'lte':
        return queryBuilder.whereRaw(`?? <= ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      case 'match':
        return queryBuilder.whereRaw(`?? ~ ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      case 'imatch':
        return queryBuilder.whereRaw(`?? ~* ${modifier}(?)`, [
          field,
          operatorValues,
        ]);
      default:
        throw new Error(`Unsupported operator for ANY/ALL: ${operator}`);
    }
  }

  /**
   * Build column select string with alias and cast
   */
  private _buildColumnSelect({ path, tableName, alias, cast }: ColumnNode) {
    if (!alias && Array.isArray(path)) {
      const firstJsonPartIndex = path.findIndex(
        p => typeof p === 'object' && p.__type === 'json',
      );

      if (firstJsonPartIndex !== -1) {
        const aliasParts = path
          .map((p, i) => {
            if (i >= firstJsonPartIndex) {
              if (typeof p === 'string') {
                return p;
              } else if (typeof p === 'object' && p.name) {
                return p.name;
              }
            }
            return '';
          })
          .filter(Boolean);

        if (aliasParts.length > 0) {
          alias = aliasParts.join('_');
        }
      }
    }

    const rawPath = this._rawField(path, tableName).toSQL().sql;
    const casted = cast ? `CAST((${rawPath}) AS ${cast})` : rawPath;
    return this.pg.raw(`${casted}${alias ? ` as "${alias}"` : ''}`);
  }

  /**
   * Handle embed node (subqueries/joins)
   */
  private _handleEmbedNode(embed: EmbedNode): void {
    const { resource } = embed;

    try {
      const joinBuilder = new JoinBuilder(this);
      joinBuilder.applyEmbedNode(embed);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to handle embed node for ${resource}: ${errorMessage}`,
      );
      throw new Exception(
        Exception.GENERAL_QUERY_BUILDER_ERROR,
        `Embed node processing failed: ${errorMessage}`,
      );
    }
  }

  // Type guards
  public static _isCondition(expression: Expression): expression is Condition {
    return (
      expression !== null &&
      typeof expression === 'object' &&
      'field' in expression &&
      'operator' in expression
    );
  }

  public static _isNotExpression(
    expression: Expression,
  ): expression is NotExpression {
    return (
      expression !== null &&
      typeof expression === 'object' &&
      'not' in expression
    );
  }

  public static _isOrExpression(
    expression: Expression,
  ): expression is OrExpression {
    return (
      expression !== null &&
      typeof expression === 'object' &&
      'or' in expression &&
      Array.isArray(expression.or)
    );
  }

  public static _isAndExpression(
    expression: Expression,
  ): expression is AndExpression {
    return (
      expression !== null &&
      typeof expression === 'object' &&
      'and' in expression &&
      Array.isArray(expression.and)
    );
  }
}
