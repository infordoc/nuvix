import { Logger } from '@nestjs/common';
import { Exception } from '@nuvix/core/extend/exception';
import type {
    Condition,
    Expression,
    JsonFieldType,
    ParserConfig,
    ParserResult,
    ParsePosition,
} from './types';
import { OrderParser } from './order';

// Lightweight token-based approach for better performance
interface Token {
    type: 'FIELD' | 'OPERATOR' | 'VALUE' | 'PAREN_OPEN' | 'PAREN_CLOSE' | 'COMMA' | 'OR' | 'NOT' | 'EOF';
    value: string;
    position: ParsePosition;
    start: number;
    end: number;
}

// Optimized error with minimal overhead
export class ParseError extends Error implements ParseError {
    constructor(
        message: string,
        public position: ParsePosition,
        public statement: string,
        public expected?: string,
        public received?: string
    ) {
        super(`${message} at line ${position.line}:${position.column}\n${statement}\n${' '.repeat(position.column - 1)}^`);
        this.name = 'ParseError';
    }
}

// Optimized lexer with single pass tokenization
class Lexer {
    private input: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private config: ParserConfig;

    constructor(input: string, config: ParserConfig) {
        this.input = input;
        this.config = config;
    }

    private currentChar(): string {
        return this.position < this.input.length ? this.input[this.position] : '';
    }

    private peek(offset: number = 1): string {
        const pos = this.position + offset;
        return pos < this.input.length ? this.input[pos] : '';
    }

    private advance(): void {
        if (this.position < this.input.length && this.input[this.position] === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        this.position++;
    }

    private skipWhitespace(): void {
        while (this.position < this.input.length && /\s/.test(this.currentChar())) {
            this.advance();
        }
    }

    private readString(quote: string): string {
        this.advance(); // Skip opening quote
        let value = '';
        let escaped = false;

        while (this.position < this.input.length) {
            const char = this.currentChar();

            if (escaped) {
                value += char;
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === quote) {
                this.advance(); // Skip closing quote
                return value;
            } else {
                value += char;
            }
            this.advance();
        }

        throw new ParseError(
            'Unterminated string literal',
            { line: this.line, column: this.column, offset: this.position },
            this.input.slice(Math.max(0, this.position - 20), this.position + 20),
            'closing quote',
            'end of input'
        );
    }

    private readIdentifier(): string {
        let value = '';
        while (this.position < this.input.length && /[a-zA-Z0-9_.-]/.test(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }
        return value;
    }

    private readUntil(endChars: string[]): string {
        let value = '';
        let depth = 0;
        let inQuotes = false;
        let quoteChar = '';

        while (this.position < this.input.length) {
            const char = this.currentChar();

            if (!inQuotes) {
                if (char === '(' || char === '[' || char === '{') depth++;
                else if (char === ')' || char === ']' || char === '}') depth--;

                if (depth === 0 && endChars.includes(char)) {
                    break;
                }
            }

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            }

            value += char;
            this.advance();
        }

        return value;
    }

    nextToken(): Token {
        this.skipWhitespace();

        if (this.position >= this.input.length) {
            return {
                type: 'EOF',
                value: '',
                position: { line: this.line, column: this.column, offset: this.position },
                start: this.position,
                end: this.position
            };
        }

        const start = this.position;
        const position = { line: this.line, column: this.column, offset: this.position };
        const char = this.currentChar();

        // Handle strings
        if (char === '"' || char === "'") {
            const value = this.readString(char);
            return {
                type: 'VALUE',
                value: char + value + char, // Include quotes for type detection
                position,
                start,
                end: this.position
            };
        }

        // Handle special characters
        if (char === this.config.groups.OPEN) {
            this.advance();
            return { type: 'PAREN_OPEN', value: char, position, start, end: this.position };
        }

        if (char === this.config.groups.CLOSE) {
            this.advance();
            return { type: 'PAREN_CLOSE', value: char, position, start, end: this.position };
        }

        if (char === this.config.groups.SEP) {
            this.advance();
            return { type: 'COMMA', value: char, position, start, end: this.position };
        }

        if (char === this.config.groups.OR) {
            this.advance();
            return { type: 'OR', value: char, position, start, end: this.position };
        }

        if (char === this.config.groups.NOT) {
            this.advance();
            return { type: 'NOT', value: char, position, start, end: this.position };
        }

        // Handle field.operator(value) or field.operator[value]
        if (/[a-zA-Z_$]/.test(char)) {
            const identifier = this.readIdentifier();

            // Check if this is followed by a function call
            this.skipWhitespace();
            if (this.currentChar() === '(') {
                this.advance(); // Skip '('
                const args = this.readUntil([')']);
                if (this.currentChar() === ')') {
                    this.advance(); // Skip ')'
                }
                return {
                    type: 'FIELD',
                    value: `${identifier}(${args})`,
                    position,
                    start,
                    end: this.position
                };
            }

            // Check if this is followed by a list
            if (this.currentChar() === '[') {
                this.advance(); // Skip '['
                const args = this.readUntil([']']);
                if (this.currentChar() === ']') {
                    this.advance(); // Skip ']'
                }
                return {
                    type: 'FIELD',
                    value: `${identifier}[${args}]`,
                    position,
                    start,
                    end: this.position
                };
            }

            return { type: 'FIELD', value: identifier, position, start, end: this.position };
        }

        // Handle unexpected character
        this.advance();
        throw new ParseError(
            'Unexpected character',
            position,
            this.input.slice(Math.max(0, start - 10), start + 10),
            'valid expression character',
            char
        );
    }

    tokenize(): Token[] {
        const tokens: Token[] = [];
        let token: Token;

        do {
            token = this.nextToken();
            tokens.push(token);
        } while (token.type !== 'EOF');

        return tokens;
    }
}

// Optimized recursive descent parser
export class OptimizedParser<T extends ParserResult = ParserResult> {
    private readonly logger = new Logger(OptimizedParser.name);
    private config: ParserConfig;
    private tableName: string;
    private mainTable: string;
    private extraData: Record<string, any> = {};
    private tokens: Token[] = [];
    private currentTokenIndex: number = 0;

    constructor(config: ParserConfig, tableName: string, mainTable?: string) {
        this.config = config;
        this.tableName = tableName;
        this.mainTable = mainTable ?? tableName;
        this._validateConfig();
    }

    static create<T>({
        tableName,
        mainTable,
    }: {
        tableName: string;
        mainTable?: string;
    }) {
        return new OptimizedParser<T>(defaultConfig, tableName, mainTable);
    }

    parse(str: string): T & Expression {
        if (typeof str !== 'string') {
            throw new ParseError(
                'Parser input must be a string',
                { line: 1, column: 1, offset: 0 },
                String(str),
                'string',
                typeof str
            );
        }

        // Reset parser state
        this.extraData = {};
        this.currentTokenIndex = 0;

        // Tokenize input
        const lexer = new Lexer(str.trim(), this.config);
        this.tokens = lexer.tokenize();

        if (this.tokens.length === 1 && this.tokens[0].type === 'EOF') {
            return null as any;
        }

        try {
            const expression = this.parseExpression();

            // Ensure we've consumed all tokens
            if (this.currentToken().type !== 'EOF') {
                throw new ParseError(
                    'Unexpected token after expression',
                    this.currentToken().position,
                    this.currentToken().value,
                    'end of input',
                    this.currentToken().value
                );
            }

            return {
                ...expression,
                ...(this.extraData as T),
            };
        } catch (error) {
            if (error instanceof ParseError) {
                throw new Exception(Exception.GENERAL_PARSER_ERROR, error.message);
            }
            throw new Exception(
                Exception.GENERAL_PARSER_ERROR,
                `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private currentToken(): Token {
        return this.currentTokenIndex < this.tokens.length
            ? this.tokens[this.currentTokenIndex]
            : this.tokens[this.tokens.length - 1]; // EOF token
    }

    private peekToken(offset: number = 1): Token {
        const index = this.currentTokenIndex + offset;
        return index < this.tokens.length
            ? this.tokens[index]
            : this.tokens[this.tokens.length - 1]; // EOF token
    }

    private consumeToken(): Token {
        const token = this.currentToken();
        if (token.type !== 'EOF') {
            this.currentTokenIndex++;
        }
        return token;
    }

    private expectToken(type: Token['type']): Token {
        const token = this.currentToken();
        if (token.type !== type) {
            throw new ParseError(
                `Expected ${type}`,
                token.position,
                token.value,
                type,
                token.type
            );
        }
        return this.consumeToken();
    }

    private _validateConfig(): void {
        if (!this.config?.groups) {
            throw new ParseError(
                'Config must include groups configuration',
                { line: 1, column: 1, offset: 0 },
                'config validation',
                'valid ParserConfig with groups',
                'invalid config'
            );
        }

        const { OPEN, CLOSE, SEP, OR, NOT } = this.config.groups;
        if (!OPEN || !CLOSE || !SEP || !OR || !NOT) {
            throw new ParseError(
                'All group characters must be defined',
                { line: 1, column: 1, offset: 0 },
                JSON.stringify(this.config.groups),
                'all group characters defined',
                `OPEN: ${OPEN}, CLOSE: ${CLOSE}, SEP: ${SEP}, OR: ${OR}, NOT: ${NOT}`
            );
        }
    }

    // Optimized linear parsing with precedence
    private parseExpression(): Expression {
        return this.parseOrExpression();
    }

    private parseOrExpression(): Expression {
        let left = this.parseAndExpression();

        while (this.currentToken().type === 'OR') {
            this.consumeToken(); // consume '|'
            const right = this.parseAndExpression();

            if (left && right) {
                if ('or' in left && Array.isArray(left.or)) {
                    left.or.push(right);
                } else {
                    left = { or: [left, right] };
                }
            }
        }

        return left;
    }

    private parseAndExpression(): Expression {
        let left = this.parseNotExpression();

        while (this.currentToken().type === 'COMMA') {
            this.consumeToken(); // consume ','
            const right = this.parseNotExpression();

            if (left && right) {
                if ('and' in left && Array.isArray(left.and)) {
                    left.and.push(right);
                } else {
                    left = { and: [left, right] };
                }
            }
        }

        return left;
    }

    private parseNotExpression(): Expression {
        if (this.currentToken().type === 'NOT') {
            const notToken = this.consumeToken();
            const expression = this.parsePrimaryExpression();

            if (!expression) {
                throw new ParseError(
                    'NOT operator requires an expression',
                    notToken.position,
                    notToken.value,
                    'expression after NOT',
                    'nothing'
                );
            }

            return { not: expression };
        }

        return this.parsePrimaryExpression();
    }

    private parsePrimaryExpression(): Expression {
        const token = this.currentToken();

        switch (token.type) {
            case 'PAREN_OPEN':
                return this.parseGroupExpression();

            case 'FIELD':
                return this.parseCondition();

            case 'EOF':
                return null;

            default:
                throw new ParseError(
                    'Unexpected token',
                    token.position,
                    token.value,
                    'field, group, or function',
                    token.type
                );
        }
    }

    private parseGroupExpression(): Expression {
        this.expectToken('PAREN_OPEN');

        if (this.currentToken().type === 'PAREN_CLOSE') {
            throw new ParseError(
                'Empty group not allowed',
                this.currentToken().position,
                '()',
                'non-empty group content',
                'empty group'
            );
        }

        const expression = this.parseExpression();
        this.expectToken('PAREN_CLOSE');

        return expression;
    }

    private parseCondition(): Condition | null {
        const fieldToken = this.expectToken('FIELD');

        // Handle special functions like $.limit(), $.offset(), etc.
        if (fieldToken.value.startsWith('$') || fieldToken.value.startsWith('this')) {
            this.handleSpecialFunction(fieldToken);
            return null;
        }

        return this.buildConditionFromToken(fieldToken);
    }

    private buildConditionFromToken(token: Token): Condition {
        const value = token.value;

        // Parse function-style: field.operator(args)
        const funcMatch = value.match(/^(.+)\.([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)$/);
        if (funcMatch) {
            const [, fieldPath, operator, args] = funcMatch;
            return this.buildCondition(fieldPath, operator, args, token);
        }

        // Parse list-style: field.operator[args]
        const listMatch = value.match(/^(.+)\.([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]*)\]$/);
        if (listMatch) {
            const [, fieldPath, operator, args] = listMatch;
            return this.buildCondition(fieldPath, operator, args, token);
        }

        throw new ParseError(
            'Invalid condition format',
            token.position,
            value,
            'field.operator(value) or field.operator[values]',
            value
        );
    }

    private buildCondition(fieldPath: string, operator: string, args: string, token: Token): Condition {
        if (!fieldPath || !operator) {
            throw new ParseError(
                'Both field and operator must be specified',
                token.position,
                token.value,
                'field.operator format',
                `field: "${fieldPath}", operator: "${operator}"`
            );
        }

        const field = this.parseField(fieldPath);
        const values = this.parseArgumentString(args);

        if (values.length === 0) {
            return { field, operator, value: null, tableName: this.tableName };
        }

        return values.length === 1
            ? { field, operator, value: values[0], tableName: this.tableName }
            : { field, operator, values, tableName: this.tableName };
    }

    private handleSpecialFunction(token: Token): void {
        const match = token.value.match(/^(?:\$|this)\.([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)$/);

        if (!match) {
            throw new ParseError(
                'Invalid special function format',
                token.position,
                token.value,
                '$.function(args) or this.function(args)',
                token.value
            );
        }

        const [, functionName, args] = match;

        switch (functionName) {
            case 'limit':
                this.extraData.limit = this.parseInteger(args, 'limit', token);
                break;
            case 'offset':
                this.extraData.offset = this.parseInteger(args, 'offset', token);
                break;
            case 'join':
                const joinType = args.toLowerCase();
                if (!['inner', 'left', 'right', 'full'].includes(joinType)) {
                    throw new ParseError(
                        'Invalid join type',
                        token.position,
                        args,
                        'inner, left, right, or full',
                        args
                    );
                }
                this.extraData.joinType = joinType;
                break;
            case 'shape':
                const shape = args.toLowerCase();
                if (!['object', 'array', '{}', '[]', 'true'].includes(shape)) {
                    throw new ParseError(
                        'Invalid shape value',
                        token.position,
                        args,
                        'object, array, {}, [], or true',
                        args
                    );
                }
                this.extraData.shape = ['object', '{}', 'true'].includes(shape) ? 'object' : 'array';
                break;
            case 'group':
                const columns = this.parseGroupBy(args);
                if (columns.length > 0) {
                    this.extraData.group = columns;
                }
                break;
            case 'order':
                const orders = OrderParser.parse(args);
                if (orders.length > 0) {
                    this.extraData.order = orders;
                }
                break;
            default:
                throw new ParseError(
                    'Unsupported special function',
                    token.position,
                    functionName,
                    'limit, offset, join, shape, group, or order',
                    functionName
                );
        }
    }

    private parseInteger(value: string, fieldName: string, token: Token): number {
        const num = Number(value);
        if (!Number.isInteger(num) || num < 0) {
            throw new ParseError(
                `${fieldName} must be a non-negative integer`,
                token.position,
                value,
                'non-negative integer',
                value
            );
        }
        return num;
    }

    private parseField(fieldPath: string): Condition['field'] {
        if (!fieldPath.includes('->') && !fieldPath.includes('->>') && !fieldPath.includes('.')) {
            return fieldPath;
        }

        const parts: (string | JsonFieldType)[] = [];
        let current = '';
        let i = 0;

        while (i < fieldPath.length) {
            if (fieldPath.substring(i, i + 3) === '->>') {
                if (current) {
                    parts.push({ name: current, operator: '->>', __type: 'json' });
                    current = '';
                }
                i += 3;
            } else if (fieldPath.substring(i, i + 2) === '->') {
                if (current) {
                    parts.push({ name: current, operator: '->', __type: 'json' });
                    current = '';
                }
                i += 2;
            } else if (fieldPath[i] === '.') {
                if (parts.some(p => typeof p === 'object' && p.__type === 'json')) {
                    throw new Error('Invalid field: dot (.) cannot be used after JSON operators');
                }
                if (current) {
                    parts.push(current);
                    current = '';
                }
                i++;
            } else {
                current += fieldPath[i];
                i++;
            }
        }

        if (current) {
            parts.push(current);
        }

        return parts;
    }

    private parseArgumentString(args: string): any[] {
        if (!args.trim()) return [];

        // Simple argument parser - could be optimized further with a proper tokenizer
        const values: any[] = [];
        let current = '';
        let depth = 0;
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < args.length; i++) {
            const char = args[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                current += char;
                quoteChar = '';
            } else if (!inQuotes) {
                if (char === '(' || char === '[' || char === '{') depth++;
                else if (char === ')' || char === ']' || char === '}') depth--;

                if (char === ',' && depth === 0) {
                    if (current.trim()) {
                        values.push(this.parseValue(current.trim()));
                    }
                    current = '';
                    continue;
                }
            }

            current += char;
        }

        if (current.trim()) {
            values.push(this.parseValue(current.trim()));
        }

        return values;
    }

    private parseValue(val: string): any {
        const trimmed = val.trim();
        if (!trimmed) return '';

        // Quoted strings
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            const content = trimmed.slice(1, -1);
            return trimmed.startsWith('"')
                ? { __type: 'column', name: content.includes('.') ? content : `${this.mainTable}.${content}` }
                : content;
        }

        // Raw literals
        if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
            return trimmed.slice(1, -1);
        }

        // Known literals
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (trimmed === 'null') return null;
        if (trimmed === 'undefined') return undefined;

        // PostgreSQL cast
        if (trimmed.includes('::')) {
            return { __type: 'raw', value: trimmed };
        }

        // Numbers
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
            const num = Number(trimmed);
            if (!isNaN(num) && isFinite(num)) return num;
        }

        return trimmed;
    }

    private parseGroupBy(args: string): Condition['field'][] {
        if (!args.trim()) return [];

        return args.split(',')
            .map(field => field.trim())
            .filter(field => field)
            .map(field => {
                // Remove quotes if present
                const unquoted = field.replace(/^['"]|['"]$/g, '');
                return this.parseField(unquoted);
            });
    }
}

const defaultConfig: ParserConfig = {
    groups: {
        OPEN: '(',
        CLOSE: ')',
        SEP: ',',
        OR: '|',
        NOT: '!',
    },
    values: {
        FUNCTION_STYLE: true,
        LIST_STYLE: '[]',
    },
};
