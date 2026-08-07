// The generative engine. A name goes in; a one-of-a-kind animated
// artwork comes out. Deterministic: the same name always paints the
// same piece. Three movement modes × eight palettes × continuous
// parameters = no two remixes alike.

import { seedFrom, mulberry32 } from './seed.js'
import { PALETTES } from './palettes.js'

export function sceneParamsFor(text) {
  const seed = seedFrom(text)
  const rand = mulberry32(seed)
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)]
  const mode = Math.floor(rand() * 3) // 0 streams · 1 orbits · 2 weave
  return {
    seed,
    palette,
    mode,
    freqX: 0.0012 + rand() * 0.0026,
    freqY: 0.0012 + rand() * 0.0026,
    curl: 1.6 + rand() * 4.2,
    drift: rand() * Math.PI * 2,
    speed: 0.45 + rand() * 0.85,
    density: 150 + Math.floor(rand() * 130),
    fade: 0.05 + rand() * 0.045,
    rings: 3 + Math.floor(rand() * 4),
    weaveA: 2 + Math.floor(rand() * 4),
    weaveB: 3 + Math.floor(rand() * 4),
    randSeq: mulberry32(seed ^ 0x9e3779b9),
  }
}

// Accent color for UI chrome (buttons, focus rings) derived from the seed
export function accentFor(text) {
  return sceneParamsFor(text).palette.colors[0]
}

function makeParticles(p, w, h) {
  const parts = []
  const r = p.randSeq
  for (let i = 0; i < p.density; i++) {
    parts.push({
      x: r() * w,
      y: r() * h,
      t: r() * Math.PI * 2,
      speed: (0.5 + r()) * p.speed,
      color: p.palette.colors[Math.floor(r() * p.palette.colors.length)],
      ring: Math.floor(r() * p.rings),
      radius: (0.08 + r() * 0.38) * Math.min(w, h),
      life: 60 + r() * 220,
    })
  }
  return parts
}

function angleAt(p, x, y, time) {
  return (
    p.curl *
    (Math.sin(x * p.freqX + p.drift + time * 0.00012) +
      Math.cos(y * p.freqY - time * 0.00009))
  )
}

function step(ctx, p, parts, w, h, time) {
  // translucent fade toward the background — this is what makes trails glow
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = hexA(p.palette.bg[0], p.fade)
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineWidth = 1.1

  const cx = w / 2
  const cy = h / 2
  const r = p.randSeq

  for (const pt of parts) {
    const px = pt.x
    const py = pt.y

    if (p.mode === 0) {
      // streams — classic flow field
      const a = angleAt(p, pt.x, pt.y, time)
      pt.x += Math.cos(a) * pt.speed * 1.6
      pt.y += Math.sin(a) * pt.speed * 1.6
    } else if (p.mode === 1) {
      // orbits — particles ride wobbling rings around off-center hubs
      const hub = pt.ring
      const hx = cx + Math.cos(p.drift + hub * 2.4) * w * 0.18
      const hy = cy + Math.sin(p.drift * 1.7 + hub * 1.9) * h * 0.18
      pt.t += (0.004 + pt.speed * 0.004) * (hub % 2 === 0 ? 1 : -1)
      const wobble = 1 + 0.16 * Math.sin(pt.t * 3 + hub)
      pt.x = hx + Math.cos(pt.t) * pt.radius * wobble
      pt.y = hy + Math.sin(pt.t) * pt.radius * wobble
    } else {
      // weave — lissajous threads through the frame
      pt.t += 0.0035 * pt.speed
      pt.x = cx + Math.sin(pt.t * p.weaveA + pt.ring) * w * 0.42
      pt.y = cy + Math.sin(pt.t * p.weaveB + pt.ring * 1.3) * h * 0.42
    }

    // wrap / respawn
    if (p.mode === 0) {
      if (pt.x < -4) pt.x = w + 4
      if (pt.x > w + 4) pt.x = -4
      if (pt.y < -4) pt.y = h + 4
      if (pt.y > h + 4) pt.y = -4
      if (--pt.life <= 0) {
        pt.x = r() * w
        pt.y = r() * h
        pt.life = 60 + r() * 220
        continue // skip drawing the teleport frame
      }
    }

    const jump = Math.abs(pt.x - px) + Math.abs(pt.y - py)
    if (jump > 60) continue // never draw teleport streaks

    ctx.strokeStyle = hexA(pt.color, 0.5)
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
  }
}

function paintBackground(ctx, p, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, p.palette.bg[0])
  g.addColorStop(1, p.palette.bg[1])
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function hexA(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

// Mounts the scene on a canvas. Returns a controller with destroy().
// Handles: DPR, resize, tab-visibility pause, prefers-reduced-motion.
export function mountScene(canvas, seedText) {
  const ctx = canvas.getContext('2d')
  let raf = 0
  let parts = []
  let w = 0
  let h = 0
  let destroyed = false
  const p = sceneParamsFor(seedText)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function size() {
    // offsetWidth, never getBoundingClientRect — zoom-safe
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.offsetWidth
    h = canvas.offsetHeight
    if (w === 0 || h === 0) return false
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return true
  }

  function init() {
    if (!size()) return
    parts = makeParticles(p, w, h)
    paintBackground(ctx, p, w, h)
    if (reduced) {
      // static render: settle the composition in one go, then stop
      for (let i = 0; i < 420; i++) step(ctx, p, parts, w, h, i * 16)
      return
    }
    start()
  }

  let time = 0
  function frame() {
    time += 16
    step(ctx, p, parts, w, h, time)
    raf = requestAnimationFrame(frame)
  }

  function start() {
    if (!raf && !destroyed) raf = requestAnimationFrame(frame)
  }

  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  function onVisibility() {
    if (document.hidden) stop()
    else if (!reduced) start()
  }

  const ro = new ResizeObserver(() => {
    stop()
    init()
  })
  ro.observe(canvas)
  document.addEventListener('visibilitychange', onVisibility)
  init()

  return {
    destroy() {
      destroyed = true
      stop()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}
