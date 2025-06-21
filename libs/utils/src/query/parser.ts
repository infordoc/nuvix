// we have to create very complex queryString parser class

import { Logger } from "@nestjs/common";
import { Exception } from "@nuvix/core/extend/exception";

interface Config {
    groups: {
        NOT: string;
        OPEN: string;
        CLOSE: string;
        OR: string;
        SEP: string;
    };
    values: {
        FUNCTION_STYLE: boolean;
        LIST_STYLE: '[]' | '()' | '{}';
        OPERATOR_STYLE: boolean;
    };
}

interface Condition {
    field: string;
    operator: string;
    value?: any;
    values?: any[];
}

interface NotExpression {
    not: Expression;
}

interface OrExpression {
    or: Expression[];
}

interface AndExpression {
    and: Expression[];
}

type Expression = Condition | NotExpression | OrExpression | AndExpression | null;

export class Parser {
    private readonly logger = new Logger(Parser.name);

    private config: Config;
    private escapeChar: string;

    constructor(config: Config) {
        this.config = config;
        this.escapeChar = '\\';
        this._validateConfig();
    }

    parse(str: string): Expression {
        if (typeof str !== 'string') {
            throw new Error('Parser input must be a string');
        }

        try {
            return this._parseExpression(str.trim());
        } catch (error) {
            if (error instanceof Error) {
                throw new Exception(Exception.GENERAL_PARSER_ERROR, `Parse error: ${error.message}`);
            }
            throw new Error('Unknown parsing error occurred');
        }
    }

    private _validateConfig(): void {
        if (!this.config?.groups) {
            throw new Error('Config must include groups configuration');
        }

        const { OPEN, CLOSE, SEP, OR, NOT } = this.config.groups;
        if (!OPEN || !CLOSE || !SEP || !OR || !NOT) {
            throw new Error('All group characters (OPEN, CLOSE, SEP, OR, NOT) must be defined');
        }

        if (OPEN === CLOSE) {
            throw new Error('OPEN and CLOSE characters cannot be the same');
        }

        // Validate matching brackets
        const bracketPairs = [
            ['{', '}'], ['(', ')'], ['[', ']']
        ];
        const validPair = bracketPairs.find(([open, close]) => open === OPEN && close === CLOSE);
        if (!validPair && OPEN !== CLOSE) {
            console.warn(`Warning: OPEN '${OPEN}' and CLOSE '${CLOSE}' are not standard bracket pairs`);
        }
    }

    private _parseExpression(str: string): Expression {
        if (!str || str.length === 0) return null;

        // Validate parentheses balance
        if (!this._isBalanced(str)) {
            throw new Error(`Unbalanced brackets in expression: "${str}"`);
        }

        // Handle NOT expressions
        if (str.startsWith(this.config.groups.NOT)) {
            const remaining = str.slice(1).trim();
            if (!remaining) {
                throw new Error('NOT operator requires an expression to negate');
            }
            return { not: this._parseExpression(remaining) };
        }

        // Handle groups
        if (str.startsWith(this.config.groups.OPEN) && str.endsWith(this.config.groups.CLOSE)) {
            const content = str.slice(1, -1).trim();
            if (!content) {
                throw new Error('Empty group expression is not allowed');
            }
            return this._parseGroup(content);
        }

        // Handle OR separator at top level
        if (this._containsTopLevelOperator(str, this.config.groups.OR)) {
            const parts = this._splitByOperator(str, this.config.groups.OR);
            if (parts.length < 2) {
                throw new Error('OR expression requires at least two operands');
            }
            const expressions = parts.map(p => this._parseExpression(p.trim())).filter(Boolean) as Expression[];
            if (expressions.length === 0) {
                throw new Error('OR expression contains no valid operands');
            }
            return { or: expressions };
        }

        // Handle explicit OR function
        if (str.startsWith('or(') && str.endsWith(')')) {
            const content = str.slice(3, -1).trim();
            if (!content) {
                throw new Error('OR function requires at least one argument');
            }
            return { or: this._parseCommaList(content) };
        }

        this.logger.debug(`Parsing expression: "${str}"`);
        // Handle comma-separated AND conditions
        if (this._containsTopLevelOperator(str, this.config.groups.SEP)) {
            const parts = this._splitByOperator(str, this.config.groups.SEP);
            this.logger.debug(`AND parts: ${JSON.stringify(parts)}`);
            if (parts.length < 2) {
                throw new Error('AND expression requires at least two operands');
            }
            const expressions = parts.map(p => this._parseExpression(p.trim())).filter(Boolean) as Expression[];
            if (expressions.length === 0) {
                throw new Error('AND expression contains no valid operands');
            }
            return { and: expressions };
        }

        // Handle individual condition
        return this._parseCondition(str);
    }

    private _parseGroup(str: string): Expression {
        if (!str) {
            throw new Error('Group cannot be empty');
        }
        this.logger.debug(`Parsing group expression: "${str}"`);
        // Check for OR separator first
        if (this._containsTopLevelOperator(str, this.config.groups.OR)) {
            const parts = this._splitByOperator(str, this.config.groups.OR);
            const expressions = parts.map(p => this._parseExpression(p.trim())).filter(Boolean) as Expression[];
            return { or: expressions };
        }

        // Check for explicit OR function
        if (str.startsWith('or(') && str.endsWith(')')) {
            const content = str.slice(3, -1).trim();
            return { or: this._parseCommaList(content) };
        }

        // Default to AND for comma-separated
        this.logger.debug(`Parsing group expression (AND): "${str}"`);
        if (this._containsTopLevelOperator(str, this.config.groups.SEP)) {
            const parts = this._splitByOperator(str, this.config.groups.SEP);
            const expressions = parts.map(p => this._parseExpression(p.trim())).filter(Boolean) as Expression[];
            return { and: expressions };
        }
        this.logger.debug(`Parsing single condition in group: "${str}"`);
        // Single condition group
        return this._parseExpression(str);
    }

    private _parseCondition(str: string): Condition {
        if (!str || str.trim().length === 0) {
            throw new Error('Condition cannot be empty');
        }

        const trimmed = str.trim();

        // Handle function-style: field.op(value) - supports complex field paths with JSON operators
        this.logger.debug(`Parsing condition: "${trimmed}"`);
        if (this.config.values.FUNCTION_STYLE) {
            const fnMatch = trimmed.match(/^([^(]+)\.([^(]+)\(([^)]*)\)$/);
            this.logger.debug(`Function-style match: ${fnMatch ? 'found' : 'not found'}`);
            if (fnMatch) {
                const [_, fieldPath, operator, args] = fnMatch;
                return this._buildCondition(`${fieldPath.trim()}.${operator.trim()}`, args);
            }
        }

        // Handle list-style: field.op[value1,value2] - supports complex field paths
        if (this.config.values.LIST_STYLE) {
            const openChar = this.config.values.LIST_STYLE[0];
            const closeChar = this.config.values.LIST_STYLE[1];

            if (!openChar || !closeChar) {
                throw new Error('Invalid LIST_STYLE configuration');
            }

            const escapedOpen = this._escapeRegexChar(openChar);
            const escapedClose = this._escapeRegexChar(closeChar);
            this.logger.debug('List Style parse condition: ', str)
            const listRegex = new RegExp(`^([^\\${escapedOpen}]+)\\${escapedOpen}([^\\${escapedClose}]*)\\${escapedClose}$`);

            const listMatch = trimmed.match(listRegex);
            if (listMatch) {
                const [_, fieldOpPath, args] = listMatch;
                // Extract the last dot-separated part as operator
                const lastDotIndex = fieldOpPath.lastIndexOf('.');
                if (lastDotIndex === -1) {
                    throw new Error(`Invalid field.operator format: "${fieldOpPath}"`);
                }
                const fieldPath = fieldOpPath.substring(0, lastDotIndex);
                const operator = fieldOpPath.substring(lastDotIndex + 1);
                return this._buildCondition(`${fieldPath}.${operator}`, args);
            }
        }

        // Handle operator-style: field.op.value - supports complex field paths
        if (this.config.values.OPERATOR_STYLE) {
            // Find the last dot that separates operator from value
            const lastDotIndex = trimmed.lastIndexOf('.');
            if (lastDotIndex > 0) {
                const beforeLastDot = trimmed.substring(0, lastDotIndex);
                const value = trimmed.substring(lastDotIndex + 1);

                // Find the second-to-last dot that separates field from operator
                const secondLastDotIndex = beforeLastDot.lastIndexOf('.');
                if (secondLastDotIndex > 0) {
                    const field = beforeLastDot.substring(0, secondLastDotIndex);
                    const operator = beforeLastDot.substring(secondLastDotIndex + 1);

                    if (!field || !operator) {
                        throw new Error(`Invalid condition format: "${trimmed}". Expected field.operator.value`);
                    }

                    return { field, operator, value: this._parseValue(value) };
                }
            }
        }

        // Default to simple existence check for simple field names
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
            return { field: trimmed, operator: 'exists', value: true };
        }

        // Handle complex field paths without operators (for existence checks)
        if (trimmed.includes('->') || trimmed.includes('->>') || trimmed.includes('::')) {
            return { field: trimmed, operator: 'exists', value: true };
        }

        throw new Error(`Unable to parse condition: "${trimmed}". Check your syntax.`);
    }

    private _buildCondition(fieldOp: string, args: string): Condition {
        if (!fieldOp || !fieldOp.includes('.')) {
            throw new Error(`Invalid field.operator format: "${fieldOp}"`);
        }

        // Find the last dot to separate field path from operator
        const lastDotIndex = fieldOp.lastIndexOf('.');
        if (lastDotIndex === -1) {
            throw new Error(`Field.operator must contain at least one dot: "${fieldOp}"`);
        }

        const field = fieldOp.substring(0, lastDotIndex);
        const operator = fieldOp.substring(lastDotIndex + 1);

        if (!field || !operator) {
            throw new Error(`Both field and operator must be specified: "${fieldOp}"`);
        }

        if (!args && args !== '') {
            return { field, operator, value: null };
        }

        const values = this._parseArgumentList(args);

        if (values.length === 0) {
            return { field, operator, value: null };
        }

        return values.length === 1
            ? { field, operator, value: values[0] }
            : { field, operator, values };
    }

    private _parseArgumentList(args: string): any[] {
        if (!args && args !== '') return [];

        const values: any[] = [];
        let current = '';
        let depth = 0;
        let inQuotes = false;
        let quoteChar = '';
        let escaped = false;

        for (let i = 0; i < args.length; i++) {
            const char = args[i];

            // Handle escapes
            if (escaped) {
                current += char;
                escaped = false;
                continue;
            }

            if (char === this.escapeChar) {
                escaped = true;
                current += char;
                continue;
            }

            // Handle quotes
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            }

            // Handle nested structures
            if (!inQuotes) {
                if (char === '(' || char === '[' || char === '{') depth++;
                if (char === ')' || char === ']' || char === '}') depth--;
            }

            // Split at comma when not in nested structure
            if (char === ',' && depth === 0 && !inQuotes) {
                const trimmed = current.trim();
                if (trimmed) {
                    values.push(this._parseValue(trimmed));
                }
                current = '';
            } else {
                current += char;
            }
        }

        // Add the last value
        const trimmed = current.trim();
        if (trimmed) {
            values.push(this._parseValue(trimmed));
        }

        return values.filter(v => v !== '');
    }

    private _parseValue(val: string): any {
        if (!val && val !== '') return '';

        const trimmed = val.trim();

        // Handle quoted strings
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }

        // Handle boolean values
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (trimmed === 'null') return null;
        if (trimmed === 'undefined') return undefined;

        // Handle ISO date strings (common in PostgreSQL)
        if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(trimmed)) {
            return trimmed;
        }

        // Handle PostgreSQL cast expressions like (field)::type
        if (trimmed.includes('::')) {
            return trimmed;
        }

        // Handle numbers (including scientific notation)
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
            const num = Number(trimmed);
            if (!isNaN(num) && isFinite(num)) {
                return num;
            }
        }

        return trimmed;
    }

    private _splitByOperator(str: string, operator: string): string[] {
        const parts: string[] = [];
        let current = '';
        let depth = 0;
        let bracketDepth = 0;
        let parenDepth = 0;
        let inQuotes = false;
        let quoteChar = '';
        let escaped = false;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            // Handle escapes
            if (escaped) {
                current += char;
                escaped = false;
                continue;
            }

            if (char === this.escapeChar) {
                escaped = true;
                current += char;
                continue;
            }

            // Handle quotes
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            }

            // Handle all types of nested structures
            if (!inQuotes) {
                // Handle configured group brackets (usually {})
                if (char === this.config.groups.OPEN) depth++;
                if (char === this.config.groups.CLOSE) depth--;

                if (char === this.config.values.LIST_STYLE[0]) bracketDepth++;
                if (char === this.config.values.LIST_STYLE[1]) bracketDepth--;
            }

            // Split at operator when not in any nested structure
            if (char === operator && depth === 0 && bracketDepth === 0 && parenDepth === 0 && !inQuotes) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            parts.push(current.trim());
        }

        return parts.filter(part => part.length > 0);
    }

    private _parseCommaList(str: string): Expression[] {
        if (!str) return [];

        const parts = this._splitByOperator(str, ',');
        const expressions = parts.map(p => this._parseExpression(p.trim())).filter(Boolean) as Expression[];

        if (expressions.length === 0) {
            throw new Error('Comma-separated list contains no valid expressions');
        }

        return expressions;
    }

    private _isBalanced(str: string): boolean {
        let groupCount = 0;
        let bracketCount = 0;
        let parenCount = 0;
        let inQuotes = false;
        let quoteChar = '';
        let escaped = false;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (char === this.escapeChar) {
                escaped = true;
                continue;
            }

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            }

            if (!inQuotes) {
                // Handle configured group brackets (usually {})
                if (char === this.config.groups.OPEN) groupCount++;
                if (char === this.config.groups.CLOSE) groupCount--;

                if (char === '[') bracketCount++;
                if (char === ']') bracketCount--;

                // Handle parentheses ()
                if (char === '(') parenCount++;
                if (char === ')') parenCount--;

                // Check for negative counts (closing before opening)
                if (groupCount < 0 || bracketCount < 0 || parenCount < 0) return false;
            }
        }

        return groupCount === 0 && bracketCount === 0 && parenCount === 0;
    }

    private _containsTopLevelOperator(str: string, operator: string): boolean {
        let depth = 0;
        let bracketDepth = 0;
        let parenDepth = 0;
        let inQuotes = false;
        let quoteChar = '';
        let escaped = false;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (char === this.escapeChar) {
                escaped = true;
                continue;
            }

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            }

            if (!inQuotes) {
                // Handle configured group brackets (usually {})
                if (char === this.config.groups.OPEN) depth++;
                if (char === this.config.groups.CLOSE) depth--;

                if (char === this.config.values.LIST_STYLE[0]) bracketDepth++;
                if (char === this.config.values.LIST_STYLE[0]) bracketDepth--;

                // Check for operator at top level (not nested in any structure)
                if (char === operator && depth === 0 && bracketDepth === 0 && parenDepth === 0) return true;
            }
        }

        return false;
    }

    private _escapeRegexChar(char: string): string {
        const specialChars = /[.*+?^${}()|[\]\\]/g;
        return char.replace(specialChars, '\\$&');
    }
}

const defaultConfig: Config = {
    // Grouping syntax options
    groups: {
        OPEN: '{',      // Can be '{', '(', or '['
        CLOSE: '}',     // Matching closing character
        SEP: ',',       // Condition separator (for AND)
        OR: '|',        // OR separator
        NOT: '!'        // NOT operator
    },

    // Value syntax options
    values: {
        FUNCTION_STYLE: true,   // Enable fn(value) syntax
        OPERATOR_STYLE: true,   // Enable op.value syntax
        LIST_STYLE: '[]'        // List format: '[]', '()', or '{}'
    }
};

export const parser = new Parser(defaultConfig);
