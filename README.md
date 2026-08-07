# 🎨 LinkCanvas

**A link-in-bio page that paints its own artwork from your name.**

Type your name and LinkCanvas generates a living, animated background that is
mathematically unique to you — same name, same artwork, forever. Every remix
of this template looks completely different from every other, automatically.

## Remix this in 3 steps

1. **Remix this app** on Replit.
2. Hit **Run**, open the page, and click **✎ Edit** in the corner.
3. Type your name, add your links, hit **Save**. Done — that's your page.

No code changes needed. Your artwork, colors, and accent are all derived
from your name the moment you type it.

## What's inside

| Screen | What it does |
|---|---|
| `/` | Your public bio page — generative artwork, name, bio, link buttons |
| `/edit` | Editor with a live artwork preview while you type |
| `/stats` | Real analytics — page views, clicks per link, click-through rate |

Every page view and link click is stored in a real database (SQLite, in
`data/`). The stats page reads it back live.

## How the generative art works

- Your name is hashed into a **seed**
- The seed deterministically picks one of **8 curated palettes**, one of
  **3 movement modes** (streams · orbits · weave), and continuous parameters
  (flow, density, drift)
- A `<canvas>` particle system paints it in real time

That's 24 broad families × infinite parameter variation. No two names collide
in any way you'd ever notice. The animation pauses when the tab is hidden and
respects `prefers-reduced-motion`.

## Customizing further

- **Design tokens** — every color, font, radius, and spacing lives in
  [`src/styles/tokens.css`](src/styles/tokens.css). Change tokens, change everything.
- **Palettes** — add or edit moods in [`src/lib/palettes.js`](src/lib/palettes.js).
- **Sample profile** — [`server/seed-data.js`](server/seed-data.js) (only used on first run).

## Stack

React + Vite · Express · SQLite (`better-sqlite3`, with an automatic
JSON-file fallback so it runs anywhere) · zero UI libraries.

```
npm install
npm run dev    # dev servers (client :5173, api :3001)
npm start      # production build + single server
```

---

Built for the Replit Template Sharing launch. Remix it — that's the point. 🎨
