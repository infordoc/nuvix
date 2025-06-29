import { Injectable } from '@nestjs/common';
import { Insert } from './schema.types';

@Injectable()
export class SchemaService {

    async insert({ pg, table, input, columns }: Insert) {
        const isArrayData = Array.isArray(input);

        let data: Record<string, any> | Record<string, any>[];

        if (columns?.length) {
            if (isArrayData) {
                data = input.map(record =>
                    columns.reduce((acc, column) => {
                        acc[column] = record[column];
                        return acc;
                    }, {} as Record<string, any>)
                );
            } else {
                data = columns.reduce((acc, column) => {
                    acc[column] = input[column];
                    return acc;
                }, {} as Record<string, any>);
            }
        } else {
            data = input;
        }

        const { qb } = pg;
        const result = await qb(table).insert(data).returning('*');

        return result;
    }
}
