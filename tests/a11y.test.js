import fs from 'fs';
import assert from 'assert';

// Ensure buttons have aria-label
const html = fs.readFileSync('public/index.html', 'utf8');
['sidebarToggle','rotateBtn','undoBtn','clearBtn','importJson','exportJson','exportPng','downloadLog'].forEach(id => {
  const regex = new RegExp(`<button[^>]*id="${id}"[^>]*aria-label=`);
  assert.ok(regex.test(html), `${id} missing aria-label`);
});

// Focus ring rules
const css = fs.readFileSync('public/styles.css', 'utf8');
assert.ok(css.includes('.btn:focus-visible'), 'focus ring rule for buttons missing');
assert.ok(css.includes('.thumb:focus-visible'), 'focus ring rule for thumbs missing');

// Thumbnails keyboard accessibility
const js = fs.readFileSync('src/app.js', 'utf8');
assert.ok(js.includes('tabIndex = 0'), 'thumbnails missing tabIndex');
assert.ok(js.includes("e.key === 'Enter'") && js.includes("e.key === ' '"), 'keyboard handlers missing');

console.log('A11Y tests passed');
