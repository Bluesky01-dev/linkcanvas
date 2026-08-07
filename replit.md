# LinkCanvas

A link-in-bio page that generates animated, mathematically unique artwork from your name.

## How to run

```
npm start       # production: builds frontend then serves everything on port 5000
npm run dev     # development: API on :3001, Vite dev server on :5173
```

The configured Replit workflow uses `npm start` (port 5000).

## Pages

| Path    | Description                                      |
|---------|--------------------------------------------------|
| `/`     | Public bio page — generative art, name, bio, links |
| `/edit` | Editor with live artwork preview                 |
| `/stats`| Page views, clicks per link, click-through rate  |

## Stack

- **Frontend**: React 18 + Vite
- **Backend**: Express
- **Database**: SQLite via `better-sqlite3` (falls back to a JSON file automatically)
- **Fonts**: Inter Variable, Instrument Serif

## Data

SQLite database is stored in `data/` (created on first run). Seed data in `server/seed-data.js` is applied only on first run.

## Customisation

- Design tokens: `src/styles/tokens.css`
- Colour palettes: `src/lib/palettes.js`
- Seed profile: `server/seed-data.js`
