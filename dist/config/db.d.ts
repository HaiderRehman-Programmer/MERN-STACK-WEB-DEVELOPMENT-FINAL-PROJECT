import Database from 'better-sqlite3';
import * as schema from '../db/schema';
export declare const db: import("drizzle-orm/better-sqlite3").BetterSQLite3Database<typeof schema> & {
    $client: Database.Database;
};
export declare const connectDB: () => Promise<void>;
//# sourceMappingURL=db.d.ts.map