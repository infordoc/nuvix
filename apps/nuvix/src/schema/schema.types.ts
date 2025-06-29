import type { DataSource } from "@nuvix/pg";


export interface Insert {
    pg: DataSource;
    table: string;
    input: Record<string, string | number | null | boolean> | Record<string, string | number | null | boolean>[];
    columns?: string[]
}
