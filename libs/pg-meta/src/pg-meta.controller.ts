import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Client } from './decorators';
import { PostgresMeta } from './lib';
import { DeparseDto, QueryDto } from './DTO/query.dto';
import * as Parser from './lib/Parser.js'
import { SchemaQueryDto } from './DTO/schema.dto';

@Controller({ path: 'meta', version: ['1'] })
export class PgMetaController {

    @Post('query')
    async query(
        @Client() client: PostgresMeta,
        @Body() body: QueryDto,
    ) {
        const { data } = await client.query(body.query, false);
        return data ?? [];
    }

    @Post('query/format')
    async format(
        @Body() body: QueryDto,
    ) {
        const { data } = await Parser.Format(body.query);
        return data;
    }

    @Post('query/parse')
    async parse(
        @Body() body: QueryDto,
    ) {
        const { data } = Parser.Parse(body.query);
        return data;
    }

    @Post('query/deparse')
    async deparse(
        @Body() body: DeparseDto,
    ) {
        const { data } = Parser.Deparse(body.ast);
        return data;
    }

    /*************************** Schemas *********************************/

    @Get('schemas')
    async getSchemas(
        @Query() query: SchemaQueryDto,
        @Client() client: PostgresMeta,
    ) {
        const { includeSystemSchemas, limit, offset } = query;
        const { data } = await client.schemas.list({
            includeSystemSchemas,
            limit,
            offset,
        });
        return data ?? [];
    }
}
