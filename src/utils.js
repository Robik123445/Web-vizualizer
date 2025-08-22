/** Utility functions for grid manipulation */

/** Create empty grid matrix */
export function createGrid(width, height) {
  const grid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(null);
    }
    grid.push(row);
  }
  return grid;
}

/** Place tile object into grid */
export function placeTile(grid, tile) {
  if (!grid[tile.y] || grid[tile.y][tile.x]) return false;
  grid[tile.y][tile.x] = tile;
  return true;
}

/** Remove tile at position */
export function removeTile(grid, x, y) {
  if (!grid[y] || !grid[y][x]) return null;
  const t = grid[y][x];
  grid[y][x] = null;
  return t;
}

/** Flatten grid into array for export */
export function serializeGrid(grid) {
  const result = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const cell = grid[y][x];
      if (cell) result.push(cell);
    }
  }
  return result;
}

/**
 * Fill existing grid from tile array
 * Grid is cleared and new tiles placed na pozície
 */
export function deserializeGrid(grid, tiles) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      grid[y][x] = null;
    }
  }
  for (const t of tiles) {
    if (grid[t.y] && grid[t.y][t.x] === null) {
      grid[t.y][t.x] = t;
    }
  }
}
