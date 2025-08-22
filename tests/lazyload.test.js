import assert from 'assert';
import { observeLazyImages, PLACEHOLDER_SRC } from '../src/lazy-loader.js';

// Minimal DOM-like stubs
const img = {
  dataset: { src: 'test.png' },
  classList: {
    classes: new Set(['thumb', 'skeleton']),
    remove(cls) { this.classes.delete(cls); },
    contains(cls) { return this.classes.has(cls); }
  },
  onload: null,
  src: PLACEHOLDER_SRC
};

const container = { querySelectorAll: () => [img] };

global.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) {
    this.cb([{ isIntersecting: true, target: el }], this);
    if (typeof el.onload === 'function') el.onload();
  }
  unobserve() {}
};

const logger = { logs: [], log(msg) { this.logs.push(msg); } };
observeLazyImages(container, logger);

assert.equal(img.src, 'test.png');
assert.ok(!img.classList.contains('skeleton'), 'skeleton not removed');
assert.ok(logger.logs.some(l => l.includes('test.png')), 'logger missing entry');

console.log('lazy load tests passed');
