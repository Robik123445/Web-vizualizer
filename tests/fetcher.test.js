import assert from 'assert';
import { safeFetch } from '../src/fetcher.js';

// mock logger for tests
const logger = { log(){} };

(async () => {
  // success scenario
  const okFetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) });
  const ok = await safeFetch('/ok.json', logger, okFetch);
  assert.strictEqual(ok.status, 200);
  assert.deepStrictEqual(ok.data, { ok: true });

  // failure scenario
  const failFetch = async () => ({ ok: false, status: 404, json: async () => ({}) });
  const fail = await safeFetch('/missing.json', logger, failFetch);
  assert.strictEqual(fail.status, 404);
  assert.strictEqual(fail.data, null);

  console.log('fetcher tests passed');
})();
