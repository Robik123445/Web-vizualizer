import assert from 'assert';
import { createGrid, placeTile, removeTile, serializeGrid } from '../src/utils.js';

// Basic tests for grid utilities
const grid = createGrid(2,2);
assert.strictEqual(grid.length, 2);
assert.strictEqual(grid[0].length, 2);

const tile = {x:0,y:0,tile:'sample/1.svg',rotation:0,color:'#fff'};
assert.ok(placeTile(grid, tile));
assert.strictEqual(grid[0][0], tile);

const removed = removeTile(grid,0,0);
assert.deepStrictEqual(removed, tile);
assert.strictEqual(grid[0][0], null);

const arr = serializeGrid(grid);
assert.deepStrictEqual(arr, []);

console.log('utils tests passed');
