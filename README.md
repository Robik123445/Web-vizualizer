# Web-vizualizer

Web-based editor for arranging decorative tiles.

## Run

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in a browser.
For dev updates use a hard refresh (`Ctrl+Shift+R`) to bypass cache.

## Structure

- `public/` – `index.html` and other static assets
- `src/` – client-side scripts
- `colors/` – color palettes and `colors.json`
- `tiles/` – tile images and `tiles.json`
- `tests/` – Node tests
- `log.txt` – request log created by the server
- `requirements.txt` – placeholder for Python deps (JS deps in `package.json`)

## Known paths

The server maps URLs to directories:

- `/` → `public/`
- `/src` → `src/`
- `/colors` → `colors/`
- `/tiles` → `tiles/`

Run tests with:

```bash
npm test
```
