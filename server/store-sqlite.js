import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { SAMPLE_PROFILE } from './seed-data.js'

const dir = path.join(process.cwd(), 'data')
fs.mkdirSync(dir, { recursive: true })

const db = new Database(path.join(dir, 'linkcanvas.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    bio TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
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

// Seed the sample profile on first run
if (!db.prepare('SELECT id FROM profile WHERE id = 1').get()) {
  db.prepare('INSERT INTO profile (id, name, bio) VALUES (1, ?, ?)')
    .run(SAMPLE_PROFILE.name, SAMPLE_PROFILE.bio)
  const ins = db.prepare('INSERT INTO links (label, url, position) VALUES (?, ?, ?)')
  SAMPLE_PROFILE.links.forEach((l, i) => ins.run(l.label, l.url, i))
}

export const store = {
  getProfile() {
    const p = db.prepare('SELECT name, bio FROM profile WHERE id = 1').get()
    const links = db.prepare('SELECT id, label, url FROM links ORDER BY position').all()
    return { ...p, links }
  },

  saveProfile({ name, bio, links }) {
    const tx = db.transaction(() => {
      db.prepare('UPDATE profile SET name = ?, bio = ? WHERE id = 1').run(name, bio)
      const keep = links.filter((l) => l.id != null).map((l) => l.id)
      const existing = db.prepare('SELECT id FROM links').all().map((r) => r.id)
      const del = db.prepare('DELETE FROM links WHERE id = ?')
      for (const id of existing) if (!keep.includes(id)) del.run(id)
      const upd = db.prepare('UPDATE links SET label = ?, url = ?, position = ? WHERE id = ?')
      const ins = db.prepare('INSERT INTO links (label, url, position) VALUES (?, ?, ?)')
      links.forEach((l, i) => {
        if (l.id != null && existing.includes(l.id)) upd.run(l.label, l.url, i, l.id)
        else ins.run(l.label, l.url, i)
      })
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
    return { views, totalClicks, clicks }
  },
}
