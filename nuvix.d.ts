import fastify from 'fastify';
import type { FastifyReply, FastifyRequest, RequestRouteOptions, SchemaCompiler } from 'fastify';
import type { Entities } from "@nuvix-tech/db";
import type { Entities as NuvixEntities } from "@nuvix/utils/types";

declare module 'fastify' {
    interface FastifyRequest {
        routeOptions: RequestRouteOptions<{
            hooks?: {
                [key: string]: { args: Array<any> }
            }
        }, SchemaCompiler>;
    }
}

declare global {
    export type NuvixRequest = FastifyRequest & Record<string | symbol | number, any>;
    export type NuvixRes = FastifyReply;
    interface ImportMeta {
        readonly env: ImportMetaEnv
    }
}

declare module '@nuvix-tech/db' {
    export interface Entities extends NuvixEntities { }
}

interface ImportMetaEnv {
    [key: string]: string;
}

export { };
