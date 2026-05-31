"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
(0, vitest_1.describe)('Health Check Integration', () => {
    (0, vitest_1.it)('should return 200 and system operational status', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/health');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.message).toBe('System Operational');
    });
    (0, vitest_1.it)('should return 404 for unknown routes', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/non-existent');
        (0, vitest_1.expect)(res.status).toBe(404);
    });
});
//# sourceMappingURL=health.integration.test.js.map