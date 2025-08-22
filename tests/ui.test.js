import fs from 'fs';
import assert from 'assert';

// basic check for sidebar toggle presence
const html = fs.readFileSync('public/index.html', 'utf8');
assert.ok(html.includes('id="sidebarToggle"'), 'sidebar toggle button missing');
console.log('UI tests passed');
