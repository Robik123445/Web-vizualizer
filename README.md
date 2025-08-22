# Web-vizualizer

Simple in-browser editor for decorative panels.

## Usage
1. Open `index.html` in a modern browser.
2. Select a tile and color from the left palette.
3. Click on the grid to place panels, rotate with **Rotate**, remove with right click or **Undo**.
4. Adjust cell size with the **Cell** slider; show or hide grid lines via **Grid** toggle.
5. Clear the scene with **Clear** when needed.
6. Import or export layout with **Import JSON** / **Export JSON**.
7. Export stage-only image via **Export PNG** (choose 1× or 2× scale).
8. Download actions log with **Download Log**.

On small screens use the **Menu** button to toggle the sidebar; layout adapts down to 640px.

During asset loading, palettes show animated placeholders so the user always knows something is happening. Selected tiles and colors are outlined for clarity.

## Development
- Custom CSS defines the UI.
- Grid utilities are in `src/utils.js`.
- Logging helper is in `src/logger.js`.

### Tests
Run basic tests for utilities:
```bash
npm test
```

### Dev server
Serve static assets with Express for local development:

```bash
npm start
```

The server exposes `public/` as the web root and maps `/src`, `/colors`, and `/tiles`. In development it disables caching (`Cache-Control: no-store`) and logs requests to `log.txt`.

## Structure
- `tiles/` and `colors/` contain sample assets and manifest JSON files.
- `log.txt` placeholder for logs; in-browser logger offers download.
- `requirements.txt` – no Python deps; JS deps via `package.json`.

## Diagnostics
- Manifest files (`tiles/tiles.json`, `colors/colors.json`) are fetched safely with clear console errors on failure.
- Toolbar badge shows loaded asset counts. If any count is zero, a red banner “Assets not loaded” appears.
- In development (served from `file://` or `localhost`), a cache-busting query ensures asset changes are picked up without manual cache clearing.
