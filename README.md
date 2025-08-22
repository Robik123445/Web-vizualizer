# Web-vizualizer

Simple in-browser editor for decorative panels.

## Usage
1. Open `index.html` in a modern browser.
2. Select a tile and color from the left palette.
3. Click on the grid to place panels, rotate with **Rotate**, remove with right click or **Undo**, reset the grid with **Reset**.
4. Export design via **Export JSON** or **Export PNG**.
5. Download actions log with **Download Log**.

On small screens use the **Menu** button to toggle the sidebar; layout adapts down to 640px.

## Development
- TailwindCSS is loaded from CDN.
- Grid utilities are in `src/utils.js`.
- Logging helper is in `src/logger.js`.

### Tests
Run basic tests for utilities:
```bash
npm test
```

## Structure
- `tiles/` and `colors/` contain sample assets and manifest JSON files.
- `log.txt` placeholder for logs; in-browser logger offers download.
- `requirements.txt` – no Python deps; JS deps via `package.json`.

## Diagnostics
- Manifest files (`tiles/tiles.json`, `colors/colors.json`) are fetched safely with clear console errors on failure.
- Toolbar badge shows loaded asset counts. If any count is zero, a red banner “Assets not loaded” appears.
- In development (served from `file://` or `localhost`), a cache-busting query ensures asset changes are picked up without manual cache clearing.
