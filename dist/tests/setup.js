"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load test environment variables
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env.test') });
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
(0, vitest_1.beforeAll)(async () => {
    // Global setup
});
(0, vitest_1.beforeEach)(() => {
    // Clear all tables synchronously for better-sqlite3
    db_1.db.delete(schema_1.wishlistTable).run();
    db_1.db.delete(schema_1.discussionRepliesTable).run();
    db_1.db.delete(schema_1.discussionsTable).run();
    db_1.db.delete(schema_1.reviewsTable).run();
    db_1.db.delete(schema_1.quizAttemptsTable).run();
    db_1.db.delete(schema_1.optionsTable).run();
    db_1.db.delete(schema_1.questionsTable).run();
    db_1.db.delete(schema_1.quizzesTable).run();
    db_1.db.delete(schema_1.lessonProgressTable).run();
    db_1.db.delete(schema_1.enrollmentsTable).run();
    db_1.db.delete(schema_1.lessonsTable).run();
    db_1.db.delete(schema_1.coursesTable).run();
    db_1.db.delete(schema_1.userAuthTable).run();
    db_1.db.delete(schema_1.usersTable).run();
});
(0, vitest_1.afterAll)(async () => {
    // Global teardown logic
});
//# sourceMappingURL=setup.js.map