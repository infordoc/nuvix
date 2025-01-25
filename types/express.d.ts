import type { Document } from '@nuvix/database';
import { Request } from 'express';

declare global {
    namespace Express {
        interface User extends Document {

        }

        interface Request {
            user?: User;

            projectId: string;

        }
    }
}