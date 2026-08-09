import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { store } from './db.js'

const app = express()
app.use(express.json())

// ---- Avatar uploads ------------------------------------------------------

const uploadsDir = path.join(process.cwd(), 'data', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '.png').toLowerCase()
      cb(null, `avatar-${Date.now()}${ext}`)
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)),
})

app.post('/api/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Upload a PNG, JPG, WebP, or GIF up to 2 MB.' })
  }
  res.json({ url: `/uploads/${req.file.filename}` })
})

app.use('/uploads', express.static(uploadsDir))

// ---- API ----------------------------------------------------------------

app.get('/api/profile', (req, res) => {
  res.json(store.getProfile())
})

const THEMES = ['cloud', 'sky', 'paper', 'midnight', 'aurora', 'prism']
const BACKGROUNDS = ['art', 'solid']
const STYLES = ['solid', 'soft', 'outline']
const SHAPES = ['rounded', 'pill', 'square']
const HEX_RE = /^#[0-9a-f]{6}$/i

app.put('/api/profile', (req, res) => {
  const { name, bio, avatarUrl, theme, background, buttonStyle, shape, accentColor, bgColor, links, socials } =
    req.body ?? {}
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' })
  }
  if (!Array.isArray(links)) {
    return res.status(400).json({ error: 'Links must be a list.' })
  }
  const cleanLinks = []
  for (const l of links) {
    const label = String(l?.label ?? '').trim()
    const url = String(l?.url ?? '').trim()
    if (!label && !url) continue
    if (!label || !url) {
      return res.status(400).json({ error: 'Every link needs both a label and a URL.' })
    }
    if (!/^(https?:\/\/|mailto:)/i.test(url)) {
      return res.status(400).json({ error: `"${label}" needs a link starting with http(s):// or mailto:` })
    }
    cleanLinks.push({
      id: Number.isInteger(l?.id) ? l.id : null,
      label,
      url,
      icon: String(l?.icon ?? '').slice(0, 32),
      enabled: l?.enabled ? 1 : 0,
    })
  }
  const cleanSocials = (Array.isArray(socials) ? socials : [])
    .map((u) => String(u ?? '').trim())
    .filter((u) => /^(https?:\/\/|mailto:)/i.test(u))
  store.saveProfile({
    name: name.trim(),
    bio: String(bio ?? '').trim(),
    avatarUrl: String(avatarUrl ?? '').trim(),
    theme: THEMES.includes(theme) ? theme : 'cloud',
    background: BACKGROUNDS.includes(background) ? background : 'art',
    buttonStyle: STYLES.includes(buttonStyle) ? buttonStyle : 'solid',
    shape: SHAPES.includes(shape) ? shape : 'rounded',
    accentColor: HEX_RE.test(accentColor) ? accentColor : '',
    bgColor: HEX_RE.test(bgColor) ? bgColor : '',
    links: cleanLinks,
    socials: cleanSocials,
  })
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
