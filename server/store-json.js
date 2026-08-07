// JSON-file fallback store. Same interface as store-sqlite.js.
import fs from 'node:fs'
import path from 'node:path'
import { SAMPLE_PROFILE } from './seed-data.js'

const dir = path.join(process.cwd(), 'data')
fs.mkdirSync(dir, { recursive: true })
const file = path.join(dir, 'linkcanvas.json')

function load() {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    const fresh = {
      profile: { name: SAMPLE_PROFILE.name, bio: SAMPLE_PROFILE.bio },
      links: SAMPLE_PROFILE.links.map((l, i) => ({ id: i + 1, ...l })),
      nextId: SAMPLE_PROFILE.links.length + 1,
      events: [],
    }
    save(fresh)
    return fresh
  }
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const store = {
  getProfile() {
    const d = load()
    return { ...d.profile, links: d.links.map(({ id, label, url }) => ({ id, label, url })) }
  },

  saveProfile({ name, bio, links }) {
    const d = load()
    d.profile = { name, bio }
    const existing = new Set(d.links.map((l) => l.id))
    d.links = links.map((l) => {
      if (l.id != null && existing.has(l.id)) return { id: l.id, label: l.label, url: l.url }
      return { id: d.nextId++, label: l.label, url: l.url }
    })
    save(d)
  },

  addEvent(kind, linkId) {
    const d = load()
    d.events.push({ kind, link_id: linkId, at: new Date().toISOString() })
    save(d)
  },

  getStats() {
    const d = load()
    const views = d.events.filter((e) => e.kind === 'view').length
    const clicks = d.links.map((l) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      count: d.events.filter((e) => e.kind === 'click' && e.link_id === l.id).length,
    }))
    const totalClicks = clicks.reduce((s, c) => s + c.count, 0)
    return { views, totalClicks, clicks }
  },
}
