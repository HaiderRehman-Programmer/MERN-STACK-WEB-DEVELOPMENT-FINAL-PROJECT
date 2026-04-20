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
(0, vitest_1.beforeAll)(async () => {
    // Global setup logic (e.g., ensuring test database is available)
});
(0, vitest_1.beforeEach)(async () => {
    // Logic to clean up tables before each test if using a real DB
});
(0, vitest_1.afterAll)(async () => {
    // Global teardown logic
});
//# sourceMappingURL=setup.js.map