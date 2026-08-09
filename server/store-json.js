// JSON-file fallback store. Same interface as store-sqlite.js.
import fs from 'node:fs'
import path from 'node:path'
import { SAMPLE_PROFILE } from './seed-data.js'

const dir = path.join(process.cwd(), 'data')
fs.mkdirSync(dir, { recursive: true })
const file = path.join(dir, 'linkcanvas-v2.json')

function load() {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    const s = SAMPLE_PROFILE
    const fresh = {
      profile: {
        name: s.name,
        bio: s.bio,
        avatarUrl: s.avatarUrl,
        theme: s.theme,
        background: s.background,
        buttonStyle: s.buttonStyle,
        shape: s.shape,
        accentColor: s.accentColor,
        bgColor: s.bgColor,
      },
      links: s.links.map((l, i) => ({ id: i + 1, ...l })),
      socials: [...s.socials],
      nextId: s.links.length + 1,
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
    return {
      // defaults for pre-existing data files
      background: 'art',
      accentColor: '',
      bgColor: '',
      ...d.profile,
      links: d.links.map(({ id, label, url, icon, enabled }) => ({ id, label, url, icon, enabled })),
      socials: [...d.socials],
    }
  },

  saveProfile({ name, bio, avatarUrl, theme, background, buttonStyle, shape, accentColor, bgColor, links, socials }) {
    const d = load()
    d.profile = { name, bio, avatarUrl, theme, background, buttonStyle, shape, accentColor, bgColor }
    const existing = new Set(d.links.map((l) => l.id))
    d.links = links.map((l) => ({
      id: l.id != null && existing.has(l.id) ? l.id : d.nextId++,
      label: l.label,
      url: l.url,
      icon: l.icon ?? '',
      enabled: l.enabled ? 1 : 0,
    }))
    d.socials = [...socials]
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
    const days = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const todays = d.events.filter((e) => e.at.slice(0, 10) === day)
      days.push({
        day,
        views: todays.filter((e) => e.kind === 'view').length,
        clicks: todays.filter((e) => e.kind === 'click').length,
      })
    }
    return { views, totalClicks, clicks, days }
  },
}
