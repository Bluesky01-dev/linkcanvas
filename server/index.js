import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { store } from './db.js'

const app = express()
app.use(express.json())

// ---- API ----------------------------------------------------------------

app.get('/api/profile', (req, res) => {
  res.json(store.getProfile())
})

app.put('/api/profile', (req, res) => {
  const { name, bio, links } = req.body ?? {}
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' })
  }
  if (!Array.isArray(links)) {
    return res.status(400).json({ error: 'Links must be a list.' })
  }
  const clean = []
  for (const l of links) {
    const label = String(l?.label ?? '').trim()
    const url = String(l?.url ?? '').trim()
    if (!label || !url) continue
    if (!/^(https?:\/\/|mailto:)/i.test(url)) {
      return res.status(400).json({ error: `"${label}" needs a link starting with http(s):// or mailto:` })
    }
    clean.push({ id: Number.isInteger(l?.id) ? l.id : null, label, url })
  }
  store.saveProfile({ name: name.trim(), bio: String(bio ?? '').trim(), links: clean })
  res.json(store.getProfile())
})

app.post('/api/view', (req, res) => {
  store.addEvent('view', null)
  res.json({ ok: true })
})

app.post('/api/click/:id', (req, res) => {
  const id = Number(req.params.id)
  if (Number.isInteger(id)) store.addEvent('click', id)
  res.json({ ok: true })
})

app.get('/api/stats', (req, res) => {
  res.json(store.getStats())
})

// ---- Static frontend (production build) ---------------------------------

const dist = path.join(process.cwd(), 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' })
    res.sendFile(path.join(dist, 'index.html'))
  })
}

// In dev ("node server/index.js dev") always use 3001 — vite owns the
// front port and proxies /api here. In production, honor the platform's PORT.
const isDev = process.argv.includes('dev')
const port = isDev ? 3001 : process.env.PORT || 3001
app.listen(port, '0.0.0.0', () => {
  console.log(`LinkCanvas server on :${port}${fs.existsSync(dist) ? ' (serving dist/)' : ' (API only — run vite for the frontend)'}`)
})
