import assert from 'assert';
import { start } from '../server.js';

// verify static files are served
(async () => {
  const port = 3100;
  const server = start(port);
  const base = `http://localhost:${port}`;
  try {
    const resApp = await fetch(`${base}/src/app.js`);
    assert.strictEqual(resApp.status, 200);

    const resColors = await fetch(`${base}/colors/colors.json`);
    assert.strictEqual(resColors.status, 200);

    const resTiles = await fetch(`${base}/tiles/tiles.json`);
    assert.strictEqual(resTiles.status, 200);

    const resImg = await fetch(`${base}/colors/basic/red.png`);
    assert.strictEqual(resImg.status, 200);

    const resSvg = await fetch(`${base}/tiles/sample/1.svg`);
    assert.strictEqual(resSvg.status, 200);

    console.log('server tests passed');
  } finally {
    server.close();
  }
})();
