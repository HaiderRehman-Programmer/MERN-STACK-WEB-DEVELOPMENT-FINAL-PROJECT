"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meili = void 0;
const meilisearch_1 = require("meilisearch");
const env_1 = require("./env");
exports.meili = new meilisearch_1.Meilisearch({
    host: env_1.env.MEILISEARCH_HOST,
    ...(env_1.env.MEILISEARCH_API_KEY && { apiKey: env_1.env.MEILISEARCH_API_KEY }),
});
//# sourceMappingURL=meilisearch.js.map