import assert from 'assert';
import { createGrid, placeTile, serializeGrid, deserializeGrid } from '../src/utils.js';

// verify export/import cycle
const grid = createGrid(2,2);
const t = { id:'1', x:1, y:1, tile:'a.svg', rotation:0, color:'#fff' };
placeTile(grid, t);
const data = serializeGrid(grid);
const grid2 = createGrid(2,2);
deserializeGrid(grid2, data);
assert.deepStrictEqual(serializeGrid(grid2), data);
console.log('import/export tests passed');
