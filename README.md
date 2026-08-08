# 🎨 LinkCanvas

**A Linktree-style link-in-bio app that paints its own artwork from your name.**

Clean white-and-blue out of the box, six switchable themes, and one signature
trick: the animated background is generated from your name — same name, same
artwork, forever. Every remix of this template looks different automatically.

## Remix this in 3 steps

1. **Remix this app** on Replit.
2. Hit **Run**, open the page, and click **✎ Edit** in the corner.
3. Type your name, add your links and socials, pick a theme, hit **Save**.

No code changes needed.

## Features

- **Bio page** — avatar (image URL or auto monogram), social icon row with
  platform auto-detection (Instagram, YouTube, X, GitHub, LinkedIn, TikTok,
  Twitch, Telegram, WhatsApp, email, websites), link buttons with emoji icons,
  share/copy button
- **Editor** (`/edit`) — tabbed (Profile · Links · Design) with a live phone
  preview; reorder links, toggle them on/off, see per-link click counts inline
- **Design system** — 6 named themes (Cloud, Sky, Paper, Midnight, Aurora,
  Prism), 3 button styles (Solid, Soft, Outline), 3 corner shapes.
  **Prism** hands the palette to your name-seed for the full generative look.
- **Analytics** (`/stats`) — real page views, per-link clicks, click-through
  rate, and a last-7-days activity chart, stored in a real database
- **Generative engine** — 8 art palettes × 3 movement modes (streams, orbits,
  weave) seeded by your name; pauses when the tab is hidden and respects
  `prefers-reduced-motion`

## Customizing further

- **Admin design tokens** — [`src/styles/tokens.css`](src/styles/tokens.css)
- **Bio themes** — add your own in [`src/lib/themes.js`](src/lib/themes.js)
- **Art palettes** — [`src/lib/palettes.js`](src/lib/palettes.js)
- **Sample profile** — [`server/seed-data.js`](server/seed-data.js) (first run only)

## Stack

React + Vite · Express · SQLite (`better-sqlite3`, with an automatic JSON-file
fallback so it runs anywhere) · zero UI libraries.

```
npm install
npm run dev    # dev servers (client :5173, api :3001)
npm start      # production build + single server
```

---

Built for the Replit Template Sharing launch. Remix it — that's the point. 🎨
