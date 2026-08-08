// Six named, complete looks. Each theme styles the whole page AND
// configures the generative canvas behind it. 'prism' hands the palette
// back to the name-seed for the full one-of-a-kind artwork.

export const THEMES = [
  {
    id: 'cloud',
    name: 'Cloud',
    dark: false,
    vars: {
      '--bg': '#f6f8fc',
      '--text': '#0f172a',
      '--dim': '#5b6b83',
      '--card': '#ffffff',
      '--card-border': '#e2e8f2',
      '--accent': '#2563eb',
      '--accent-soft': '#e8f0fe',
      '--accent-ink': '#ffffff',
    },
    canvas: {
      bg: ['#f6f8fc', '#eef3fb'],
      colors: ['#93c5fd', '#bfdbfe', '#60a5fa', '#dbeafe'],
      fade: 0.06,
    },
  },
  {
    id: 'sky',
    name: 'Sky',
    dark: false,
    vars: {
      '--bg': '#e9f3ff',
      '--text': '#0c2340',
      '--dim': '#48688c',
      '--card': '#ffffff',
      '--card-border': '#d7e6f8',
      '--accent': '#0ea5e9',
      '--accent-soft': '#dff2fd',
      '--accent-ink': '#ffffff',
    },
    canvas: {
      bg: ['#e9f3ff', '#d8ebff'],
      colors: ['#7dd3fc', '#38bdf8', '#bae6fd', '#a5d8ff'],
      fade: 0.055,
    },
  },
  {
    id: 'paper',
    name: 'Paper',
    dark: false,
    vars: {
      '--bg': '#faf9f6',
      '--text': '#1c2333',
      '--dim': '#6b7280',
      '--card': '#ffffff',
      '--card-border': '#e7e5df',
      '--accent': '#1e3a8a',
      '--accent-soft': '#e9edf8',
      '--accent-ink': '#ffffff',
    },
    canvas: {
      bg: ['#faf9f6', '#f2f0ea'],
      colors: ['#c7d2e8', '#94a3c8', '#dde3f0', '#b6c2dd'],
      fade: 0.06,
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    dark: true,
    vars: {
      '--bg': '#0b1220',
      '--text': '#f1f5fb',
      '--dim': '#94a7c4',
      '--card': 'rgba(255,255,255,0.055)',
      '--card-border': 'rgba(255,255,255,0.13)',
      '--accent': '#3b82f6',
      '--accent-soft': 'rgba(59,130,246,0.16)',
      '--accent-ink': '#ffffff',
    },
    canvas: {
      bg: ['#0b1220', '#101c33'],
      colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#22d3ee'],
      fade: 0.05,
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    dark: true,
    vars: {
      '--bg': '#0a0f1e',
      '--text': '#eef2f9',
      '--dim': '#8fa1bd',
      '--card': 'rgba(255,255,255,0.055)',
      '--card-border': 'rgba(255,255,255,0.13)',
      '--accent': '#34d399',
      '--accent-soft': 'rgba(52,211,153,0.16)',
      '--accent-ink': '#06281c',
    },
    canvas: {
      bg: ['#0a0f1e', '#101a2e'],
      colors: ['#34d399', '#a78bfa', '#22d3ee', '#4ade80'],
      fade: 0.05,
    },
  },
  {
    id: 'prism',
    name: 'Prism',
    dark: true,
    // palette comes from the name-seed (the original LinkCanvas artwork);
    // page vars are filled at runtime from that palette's accent
    vars: {
      '--bg': '#0a0a0f',
      '--text': '#f5f5f7',
      '--dim': 'rgba(245,245,247,0.62)',
      '--card': 'rgba(255,255,255,0.06)',
      '--card-border': 'rgba(255,255,255,0.14)',
      '--accent': '#7bdff2',
      '--accent-soft': 'rgba(255,255,255,0.1)',
      '--accent-ink': '#0a0a0f',
    },
    canvas: null, // null -> name-seeded palette
  },
]

export function themeById(id) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
