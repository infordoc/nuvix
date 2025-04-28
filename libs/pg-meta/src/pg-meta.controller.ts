import { Body, Controller, Get, Post, Query, Param, Patch, Delete } from '@nestjs/common';
import { Client } from './decorators';
import { PostgresMeta } from './lib';
import { DeparseDto, QueryDto } from './DTO/query.dto';
import * as Parser from './lib/Parser.js'
import { SchemaQueryDto } from './DTO/schema.dto';
import { SchemaIdParamDto } from './DTO/schema-id.dto';
import { SchemaCreateDto } from './DTO/schema-create.dto';
import { SchemaUpdateDto } from './DTO/schema-update.dto';
import { SchemaDeleteQueryDto } from './DTO/schema-delete.dto';

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

    @Get('schemas/:id')
    async getSchemaById(
        @Param() params: SchemaIdParamDto,
        @Client() client: PostgresMeta,
    ) {
        const { id } = params;
        const { data } = await client.schemas.retrieve({ id });
        return data;
    }

    @Post('schemas')
    async createSchema(
        @Body() body: SchemaCreateDto,
        @Client() client: PostgresMeta,
    ) {
        const { data } = await client.schemas.create(body);
        return data;
    }

    @Patch('schemas/:id')
    async updateSchema(
        @Param() params: SchemaIdParamDto,
        @Body() body: SchemaUpdateDto,
        @Client() client: PostgresMeta,
    ) {
        const { id } = params;
        const { data } = await client.schemas.update(id, body);
        return data;
    }

    @Delete('schemas/:id')
    async deleteSchema(
        @Param() params: SchemaIdParamDto,
        @Query() query: SchemaDeleteQueryDto,
        @Client() client: PostgresMeta,
    ) {
        const { id } = params;
        const { cascade } = query;
        const { data } = await client.schemas.remove(id, { cascade });
        return data;
    }
}
