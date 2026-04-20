import { Pool } from 'pg';
import * as schema from '../db/schema';
export declare const pool: Pool;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: Pool;
};
export declare const connectDB: () => Promise<void>;
//# sourceMappingURL=db.d.ts.map