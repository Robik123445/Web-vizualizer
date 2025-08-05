import { createGrid, placeTile, removeTile, serializeGrid } from './utils.js';
import { Logger } from './logger.js';

// Grid configuration
const GRID_WIDTH = 8;
const GRID_HEIGHT = 4;
const CELL_SIZE = 80;

const logger = new Logger();

let activeTile = null;
let activeColor = '#ff0000';
let rotation = 0; // 0,90,180,270
const history = [];

const gridData = createGrid(GRID_WIDTH, GRID_HEIGHT);
const gridSvg = document.getElementById('grid');
const usageDiv = document.getElementById('usage');

init();

/** Main init */
async function init() {
  gridSvg.setAttribute('width', GRID_WIDTH * CELL_SIZE);
  gridSvg.setAttribute('height', GRID_HEIGHT * CELL_SIZE);
  drawGridLines();
  await loadTiles();
  await loadColors();
  bindUI();
}

/** Draw background grid */
function drawGridLines() {
  for (let y = 0; y <= GRID_HEIGHT; y++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', y * CELL_SIZE);
    line.setAttribute('x2', GRID_WIDTH * CELL_SIZE);
    line.setAttribute('y2', y * CELL_SIZE);
    line.setAttribute('stroke', '#ccc');
    gridSvg.appendChild(line);
  }
  for (let x = 0; x <= GRID_WIDTH; x++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x * CELL_SIZE);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', x * CELL_SIZE);
    line.setAttribute('y2', GRID_HEIGHT * CELL_SIZE);
    line.setAttribute('stroke', '#ccc');
    gridSvg.appendChild(line);
  }
}

/** Fetch tiles from manifest and render palette */
async function loadTiles() {
  const res = await fetch('tiles/tiles.json');
  const data = await res.json();
  const palette = document.getElementById('tilePalette');
  for (const [collection, files] of Object.entries(data)) {
    for (const file of files) {
      const img = document.createElement('img');
      img.src = `tiles/${collection}/${file}`;
      img.className = 'cursor-pointer border';
      img.addEventListener('click', () => {
        activeTile = { collection, file };
        logger.log(`select tile ${collection}/${file}`);
      });
      palette.appendChild(img);
    }
  }
}

/** Fetch colors from manifest and render palette */
async function loadColors() {
  const res = await fetch('colors/colors.json');
  const data = await res.json();
  const palette = document.getElementById('colorPalette');
  for (const [paletteName, items] of Object.entries(data)) {
    for (const item of items) {
      const img = document.createElement('img');
      img.src = `colors/${paletteName}/${item.file}`;
      img.className = 'cursor-pointer border';
      img.addEventListener('click', () => {
        activeColor = item.color;
        logger.log(`select color ${item.name}`);
      });
      palette.appendChild(img);
    }
  }
}

/** Attach listeners for grid and buttons */
function bindUI() {
  gridSvg.addEventListener('click', onGridClick);
  gridSvg.addEventListener('contextmenu', e => e.preventDefault());
  gridSvg.addEventListener('mousedown', e => {
    if (e.button === 2) {
      const pt = getCellFromEvent(e);
      const removed = removeTile(gridData, pt.x, pt.y);
      if (removed) {
        const node = document.getElementById(removed.id);
        node && node.remove();
        logger.log(`remove tile at ${pt.x},${pt.y}`);
        updateUsage();
      }
    }
  });

  document.getElementById('rotateBtn').addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    logger.log(`rotation set to ${rotation}`);
  });
  document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('resetBtn').addEventListener('click', resetGrid);
  document.getElementById('exportJson').addEventListener('click', exportJson);
  document.getElementById('exportPng').addEventListener('click', exportPng);
  document.getElementById('downloadLog').addEventListener('click', () => logger.download());
}

/** Handle grid click to place tile */
function onGridClick(e) {
  if (!activeTile) return;
  const pt = getCellFromEvent(e);
  const tileObj = {
    id: `tile-${Date.now()}`,
    tile: `${activeTile.collection}/${activeTile.file}`,
    x: pt.x,
    y: pt.y,
    rotation,
    color: activeColor
  };
  if (placeTile(gridData, tileObj)) {
    drawTile(tileObj);
    history.push(tileObj);
    logger.log(`place tile ${tileObj.tile} at ${pt.x},${pt.y}`);
    updateUsage();
  }
}

/** Convert mouse event to grid cell */
function getCellFromEvent(e) {
  const rect = gridSvg.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  return { x, y };
}

/** Render tile into SVG */
function drawTile(t) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', t.id);
  g.setAttribute('transform', `translate(${t.x * CELL_SIZE},${t.y * CELL_SIZE}) rotate(${t.rotation}, ${CELL_SIZE/2}, ${CELL_SIZE/2})`);

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', CELL_SIZE);
  rect.setAttribute('height', CELL_SIZE);
  rect.setAttribute('fill', t.color);
  g.appendChild(rect);

  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `tiles/${t.tile}`);
  img.setAttribute('width', CELL_SIZE);
  img.setAttribute('height', CELL_SIZE);
  g.appendChild(img);

  gridSvg.appendChild(g);
}

/** Undo last placement */
function undo() {
  const last = history.pop();
  if (last) {
    removeTile(gridData, last.x, last.y);
    const node = document.getElementById(last.id);
    node && node.remove();
    logger.log('undo');
    updateUsage();
  }
}

function resetGrid() {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const t = gridData[y][x];
      if (t) {
        const node = document.getElementById(t.id);
        node && node.remove();
        gridData[y][x] = null;
      }
    }
  }
  history.length = 0;
  logger.log("reset");
  updateUsage();
}

/** Update usage list of tiles */
function updateUsage() {
  const all = serializeGrid(gridData);
  const map = {};
  for (const t of all) {
    const key = `${t.tile}|${t.color}`;
    map[key] = (map[key] || 0) + 1;
  }
  usageDiv.innerHTML = Object.entries(map)
    .map(([k, v]) => {
      const [tile, color] = k.split('|');
      return `<div>${tile} ${color} : ${v}</div>`;
    })
    .join('');
}

/** Export grid definition as JSON file */
function exportJson() {
  const data = serializeGrid(gridData);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'design.json';
  a.click();
  URL.revokeObjectURL(url);
  logger.log('export json');
}

/** Export grid visual as PNG */
function exportPng() {
  const xml = new XMLSerializer().serializeToString(gridSvg);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const image64 = 'data:image/svg+xml;base64,' + svg64;
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = GRID_WIDTH * CELL_SIZE;
    canvas.height = GRID_HEIGHT * CELL_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'design.png';
    a.click();
    logger.log('export png');
  };
  img.src = image64;
}
