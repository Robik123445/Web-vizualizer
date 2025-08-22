import fs from 'fs';
import assert from 'assert';

// ensure new controls exist in toolbar
const html = fs.readFileSync('public/index.html', 'utf8');

assert.ok(html.includes('id="cellSize"'), 'cell size slider missing');
assert.ok(html.includes('id="gridToggle"'), 'grid toggle missing');
assert.ok(html.includes('id="clearBtn"'), 'clear button missing');

console.log('control tests passed');

