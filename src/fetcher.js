/**
 * Safe JSON fetch with optional cache busting in development.
 * @param {string} url - Relative URL to JSON asset.
 * @param {object} logger - Logger instance with log method.
 * @param {Function} fetchFn - Custom fetch implementation for testing.
 * @returns {Promise<{data: any|null, status: number}>}
 */
export async function safeFetch(url, logger = console, fetchFn = fetch) {
  const fullUrl = url + cacheBust;
  let status = 0;
  try {
    const res = await fetchFn(fullUrl);
    status = res.status;
    if (!res.ok) throw new Error(`HTTP ${status}`);
    const data = await res.json();
    return { data, status };
  } catch (err) {
    const msg = `fetch ${url} failed: ${err.message}`;
    if (logger && typeof logger.log === 'function') logger.log(msg);
    if (typeof console !== 'undefined' && typeof console.error === 'function') console.error(msg);
    return { data: null, status };
  }
}

/**
 * Cache busting query for development environment.
 * Uses current timestamp when served from localhost or file protocol.
 */
export const cacheBust = (() => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (protocol === 'file:' || hostname === 'localhost') {
      return `?v=${Date.now()}`;
    }
  }
  return '';
})();
