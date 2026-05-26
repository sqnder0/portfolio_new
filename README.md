# Portfolio New

A Phaser 3 + Vite project that renders a tile-based room/garden scene with Matter.js physics, animated tiles, and a controllable character.

## Prerequisites
- Node.js 18+ (recommended for Vite 7)
- npm 9+ (comes with Node)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server (Vite picks a free port, usually 5173/5174):
   ```bash
   npm run dev
   ```
3. Open the printed Local URL in your browser. Hot reload is enabled.

## Scripts
- `npm run dev` – Start Vite dev server.
- `npm run build` – Production build to `dist/`.
- `npm run preview` – Preview the production build locally.
- `npm run start` – Production preview server bound to `0.0.0.0` and `PORT` (for Nixpacks/containers).

## Project Structure (excerpt)
- `src/main.js` – Game setup, loading tilemaps/tilesets, Matter bodies, camera follow, animations.
- `src/animations.js` – Character animation definitions.
- `src/styles.css` – Basic page styling / canvas sizing.
- `public/assets/tiles/` – Tilemap JSON (`room_base.json`), tilesets, and images (room, interior, garden, cars).
- `public/assets/spritesheets/` – Character sprite sheets.

## Working with Tiled Assets
- Tilemap: `public/assets/tiles/room_base.json` (orthogonal, 32×32 base tiles).
- Tilesets: `room_tileset_32`, `room_tileset_16`, `interior_1`, `garden bg`, `garden`, `cars` (paths under `public/assets/tiles/`).
- Animated tiles: Each animated tile uses a unique animation key derived from its frame index to avoid sharing animations between tiles.
- Object layers (`walls`, `furniture`, `props`, `interior 1`, `garden`, `cars`): collision bodies and sprites are generated in `loadObjectLayer`.

## Notes
- If you add new tilesets in Tiled, ensure the image filenames and Tiled tileset names exactly match the keys loaded in `preload()` in `src/main.js`.
- Vite serves from `public/` at root (`/assets/...`), so keep asset paths aligned with those URLs.
- Matter.js debug can be toggled in `config.physics.matter.debug` inside `src/main.js`.

## Building for Production
```bash
npm run build
```
Output goes to `dist/`. You can preview it with `npm run preview`.

## Deploying with Nixpacks
This repository includes `/tmp/workspace/sqnder0/portfolio_new/nixpacks.toml` so Nixpacks uses:
- setup: Node.js 20
- install: `npm ci`
- build: `npm run build`
- start: `npm run start`

At runtime, set `PORT` if your platform provides one (the start script already honors it).

## Troubleshooting
- Port already in use: Vite auto-selects the next free port (shown in the console).
- Missing texture/tileset: Check for case-sensitive file name/path mismatches and ensure the tileset name in Tiled matches the key used in `preload()`/`addTilesetImage()`.
