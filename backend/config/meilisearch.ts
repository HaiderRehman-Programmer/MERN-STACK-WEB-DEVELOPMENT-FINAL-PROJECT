import { Meilisearch } from 'meilisearch';
import { env } from './env';

export const meili = new Meilisearch({
  host: env.MEILISEARCH_HOST,
  ...(env.MEILISEARCH_API_KEY && { apiKey: env.MEILISEARCH_API_KEY }),
});
