import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { SAMPLE_PROFILE } from './seed-data.js'

const dir = path.join(process.cwd(), 'data')
fs.mkdirSync(dir, { recursive: true })

// v2 schema (appearance + socials). New filename so upgrades reseed cleanly.
const db = new Database(path.join(dir, 'linkcanvas-v2.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    theme TEXT NOT NULL DEFAULT 'cloud',
    background TEXT NOT NULL DEFAULT 'art',
    button_style TEXT NOT NULL DEFAULT 'solid',
    shape TEXT NOT NULL DEFAULT 'rounded'
  );
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '',
    enabled INTEGER NOT NULL DEFAULT 1,
    position INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS socials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    link_id INTEGER,
    at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// existing v2 databases: add columns introduced after the first v2 release
for (const ddl of [
  "ALTER TABLE profile ADD COLUMN background TEXT NOT NULL DEFAULT 'art'",
  "ALTER TABLE profile ADD COLUMN accent_color TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE profile ADD COLUMN bg_color TEXT NOT NULL DEFAULT ''",
]) {
  try {
    db.exec(ddl)
  } catch {
    /* column already exists */
  }
}

if (!db.prepare('SELECT id FROM profile WHERE id = 1').get()) {
  const s = SAMPLE_PROFILE
  db.prepare(
    'INSERT INTO profile (id, name, bio, avatar_url, theme, background, button_style, shape) VALUES (1, ?, ?, ?, ?, ?, ?, ?)'
  ).run(s.name, s.bio, s.avatarUrl, s.theme, s.background, s.buttonStyle, s.shape)
  const il = db.prepare('INSERT INTO links (label, url, icon, enabled, position) VALUES (?, ?, ?, ?, ?)')
  s.links.forEach((l, i) => il.run(l.label, l.url, l.icon, l.enabled, i))
  const is = db.prepare('INSERT INTO socials (url, position) VALUES (?, ?)')
  s.socials.forEach((u, i) => is.run(u, i))
}

export const store = {
  getProfile() {
    const p = db
      .prepare(
        'SELECT name, bio, avatar_url avatarUrl, theme, background, button_style buttonStyle, shape, accent_color accentColor, bg_color bgColor FROM profile WHERE id = 1'
      )
      .get()
    const links = db.prepare('SELECT id, label, url, icon, enabled FROM links ORDER BY position').all()
    const socials = db.prepare('SELECT url FROM socials ORDER BY position').all().map((r) => r.url)
    return { ...p, links, socials }
  },

  saveProfile({ name, bio, avatarUrl, theme, background, buttonStyle, shape, accentColor, bgColor, links, socials }) {
    const tx = db.transaction(() => {
      db.prepare(
        'UPDATE profile SET name = ?, bio = ?, avatar_url = ?, theme = ?, background = ?, button_style = ?, shape = ?, accent_color = ?, bg_color = ? WHERE id = 1'
      ).run(name, bio, avatarUrl, theme, background, buttonStyle, shape, accentColor, bgColor)

      const keep = links.filter((l) => l.id != null).map((l) => l.id)
      const existing = db.prepare('SELECT id FROM links').all().map((r) => r.id)
      const del = db.prepare('DELETE FROM links WHERE id = ?')
      for (const id of existing) if (!keep.includes(id)) del.run(id)
      const upd = db.prepare('UPDATE links SET label = ?, url = ?, icon = ?, enabled = ?, position = ? WHERE id = ?')
      const ins = db.prepare('INSERT INTO links (label, url, icon, enabled, position) VALUES (?, ?, ?, ?, ?)')
      links.forEach((l, i) => {
        if (l.id != null && existing.includes(l.id)) upd.run(l.label, l.url, l.icon, l.enabled ? 1 : 0, i, l.id)
        else ins.run(l.label, l.url, l.icon, l.enabled ? 1 : 0, i)
      })

      db.prepare('DELETE FROM socials').run()
      const is = db.prepare('INSERT INTO socials (url, position) VALUES (?, ?)')
      socials.forEach((u, i) => is.run(u, i))
    })
    tx()
  },

  addEvent(kind, linkId) {
    db.prepare('INSERT INTO events (kind, link_id) VALUES (?, ?)').run(kind, linkId)
  },

  getStats() {
    const views = db.prepare("SELECT COUNT(*) c FROM events WHERE kind = 'view'").get().c
    const clicks = db
      .prepare(`
        SELECT l.id, l.label, l.url, COUNT(e.id) count
        FROM links l
        LEFT JOIN events e ON e.link_id = l.id AND e.kind = 'click'
        GROUP BY l.id ORDER BY l.position
      `)
      .all()
    const totalClicks = clicks.reduce((s, c) => s + c.count, 0)
    const byDay = db
      .prepare(`
        SELECT substr(at, 1, 10) day,
               SUM(kind = 'view') views,
               SUM(kind = 'click') clicks
        FROM events
        WHERE at >= datetime('now', '-7 days')
        GROUP BY day
      `)
      .all()
    return { views, totalClicks, clicks, days: fillDays(byDay) }
  },
}

// last 7 calendar days (UTC), zero-filled
function fillDays(rows) {
  const map = Object.fromEntries(rows.map((r) => [r.day, r]))
  const out = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    out.push({ day: d, views: map[d]?.views ?? 0, clicks: map[d]?.clicks ?? 0 })
  }
  return out
}
