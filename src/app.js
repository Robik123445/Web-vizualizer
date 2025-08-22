import { createGrid, placeTile, removeTile, serializeGrid, deserializeGrid } from './utils.js';
import { Logger } from './logger.js';
import { safeFetch, cacheBust } from './fetcher.js';
import { observeLazyImages, PLACEHOLDER_SRC } from './lazy-loader.js';

// Grid configuration
const GRID_WIDTH = 8;
const GRID_HEIGHT = 4;
let cellSize = 120;

const logger = new Logger();

let activeTile = null;
let activeColor = '#ff0000';
let rotation = 0; // 0,90,180,270
const history = [];

const gridData = createGrid(GRID_WIDTH, GRID_HEIGHT);
const gridSvg = document.getElementById('grid');
const usageDiv = document.getElementById('usage');
const assetBadge = document.getElementById('assetBadge');
const assetBanner = document.getElementById('assetBanner');
const sidebar = document.getElementById('sidebar');

init();

/** Main init */
async function init() {
  redrawGrid();
  const tilesInfo = await loadTiles();
  const colorsInfo = await loadColors();
  console.log(`/tiles/tiles.json status: ${tilesInfo.status}, count: ${tilesInfo.count}`);
  console.log(`/colors/colors.json status: ${colorsInfo.status}, count: ${colorsInfo.count}`);
  updateAssetStatus(tilesInfo.count, colorsInfo.count);
  bindUI();
}

/** Draw background grid */
function drawGridLines() {
  for (let y = 0; y <= GRID_HEIGHT; y++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('grid-line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', y * cellSize);
    line.setAttribute('x2', GRID_WIDTH * cellSize);
    line.setAttribute('y2', y * cellSize);
    line.setAttribute('stroke', '#ccc');
    gridSvg.appendChild(line);
  }
  for (let x = 0; x <= GRID_WIDTH; x++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('grid-line');
    line.setAttribute('x1', x * cellSize);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', x * cellSize);
    line.setAttribute('y2', GRID_HEIGHT * cellSize);
    line.setAttribute('stroke', '#ccc');
    gridSvg.appendChild(line);
  }
}

/** Redraw grid lines and existing tiles based on current cell size */
function redrawGrid() {
  gridSvg.setAttribute('width', GRID_WIDTH * cellSize);
  gridSvg.setAttribute('height', GRID_HEIGHT * cellSize);
  gridSvg.innerHTML = '';
  drawGridLines();
  for (const t of serializeGrid(gridData)) {
    drawTile(t);
  }
  const toggle = document.getElementById('gridToggle');
  if (toggle && !toggle.checked) {
    gridSvg.querySelectorAll('.grid-line').forEach(l => (l.style.display = 'none'));
  }
}

/**
 * Fetch tiles from manifest and render palette.
 * On failure, log error and inform user. Returns status and count.
 */
async function loadTiles() {
  const palette = document.getElementById('tilePalette');
  palette.innerHTML = '<div class="thumb skeleton"></div>'.repeat(4);
  const { data, status } = await safeFetch('tiles/tiles.json', logger);
  palette.innerHTML = '';
  if (!data) {
    palette.innerHTML = '<p class="text-red-500">Failed to load tiles.</p>';
    return { status, count: 0 };
  }
  let count = 0;
  for (const [collection, files] of Object.entries(data)) {
    for (const file of files) {
      const img = document.createElement('img');
      img.src = PLACEHOLDER_SRC; // simple placeholder
      img.dataset.src = `tiles/${collection}/${file}${cacheBust}`;
      img.className = 'thumb skeleton';
      img.alt = `${collection} ${file}`;
      img.tabIndex = 0;
      // select tile and mark as active
      const selectTile = () => {
        activeTile = { collection, file };
        palette.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        img.classList.add('selected');
        logger.log(`select tile ${collection}/${file}`);
      };
      img.addEventListener('click', selectTile);
      img.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectTile();
        }
      });
      palette.appendChild(img);
      count++;
    }
  }
  observeLazyImages(palette, logger); // lazy load thumbnails
  return { status, count };
}

/**
 * Fetch colors from manifest and render palette.
 * On failure, log error and inform user. Returns status and count.
 */
async function loadColors() {
  const palette = document.getElementById('colorPalette');
  palette.innerHTML = '<div class="thumb skeleton"></div>'.repeat(4);
  const { data, status } = await safeFetch('colors/colors.json', logger);
  palette.innerHTML = '';
  if (!data) {
    palette.innerHTML = '<p class="text-red-500">Failed to load colors.</p>';
    return { status, count: 0 };
  }
  let count = 0;
  for (const [paletteName, items] of Object.entries(data)) {
    for (const item of items) {
      const img = document.createElement('img');
      img.src = PLACEHOLDER_SRC; // simple placeholder
      img.dataset.src = `colors/${paletteName}/${item.file}${cacheBust}`;
      img.className = 'thumb skeleton';
      img.alt = item.name;
      img.tabIndex = 0;
      // select color and mark as active
      const selectColor = () => {
        activeColor = item.color;
        palette.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        img.classList.add('selected');
        logger.log(`select color ${item.name}`);
      };
      img.addEventListener('click', selectColor);
      img.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectColor();
        }
      });
      palette.appendChild(img);
      count++;
    }
  }
  observeLazyImages(palette, logger); // lazy load thumbnails
  return { status, count };
}

/**
 * Update top-right badge and show banner on missing assets.
 * @param {number} tileCount - number of loaded tiles
 * @param {number} colorCount - number of loaded colors
 */
function updateAssetStatus(tileCount, colorCount) {
  assetBadge.textContent = `Tiles: ${tileCount} | Colors: ${colorCount}`;
  if (tileCount === 0 || colorCount === 0) {
    assetBanner.classList.remove('hidden');
  } else {
    assetBanner.classList.add('hidden');
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
  document.getElementById('clearBtn').addEventListener('click', clearGrid);
  document.getElementById('importJson').addEventListener('click', importJson);
  document.getElementById('exportJson').addEventListener('click', exportJson);
  document.getElementById('exportPng').addEventListener('click', exportPng);
  document.getElementById('downloadLog').addEventListener('click', () => logger.download());

  document.getElementById('cellSize').addEventListener('input', e => {
    cellSize = Number(e.target.value);
    redrawGrid();
    logger.log(`cell size ${cellSize}`);
  });

  document.getElementById('gridToggle').addEventListener('change', e => {
    const show = e.target.checked;
    gridSvg.querySelectorAll('.grid-line').forEach(l => (l.style.display = show ? 'block' : 'none'));
    logger.log(`grid ${show ? 'shown' : 'hidden'}`);
  });
  // toggle sidebar for mobile view
  const sidebarToggle = document.getElementById('sidebarToggle');
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    logger.log('toggle sidebar');
  });
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
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);
  return { x, y };
}

/** Render tile into SVG */
function drawTile(t) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', t.id);
  g.setAttribute('transform', `translate(${t.x * cellSize},${t.y * cellSize}) rotate(${t.rotation}, ${cellSize/2}, ${cellSize/2})`);

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', cellSize);
  rect.setAttribute('height', cellSize);
  rect.setAttribute('fill', t.color);
  g.appendChild(rect);

  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `tiles/${t.tile}`);
  img.setAttribute('width', cellSize);
  img.setAttribute('height', cellSize);
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

function clearGrid() {
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
  redrawGrid();
  logger.log('clear grid');
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
  const data = { cellSize, tiles: serializeGrid(gridData) };
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
  const scale = Number(document.getElementById('pngScale').value || 1);
  const xml = new XMLSerializer().serializeToString(gridSvg);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const image64 = 'data:image/svg+xml;base64,' + svg64;
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = GRID_WIDTH * cellSize * scale;
    canvas.height = GRID_HEIGHT * cellSize * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'design.png';
    a.click();
    logger.log(`export png ${scale}x`);
  };
  img.src = image64;
}

/** Import grid definition from JSON file */
function importJson() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.cellSize) {
          cellSize = data.cellSize;
          document.getElementById('cellSize').value = cellSize;
        }
        clearGrid();
        if (Array.isArray(data.tiles)) {
          deserializeGrid(gridData, data.tiles);
          for (const t of data.tiles) {
            drawTile(t);
            history.push(t);
          }
        }
        updateUsage();
        logger.log('import json');
      } catch (err) {
        logger.log('import json failed');
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
