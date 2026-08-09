// Tiny color helpers for custom accent / background colors.

export const HEX_RE = /^#[0-9a-f]{6}$/i

// Readable ink (text) color on top of a given hex background
export function inkFor(hex) {
  if (!HEX_RE.test(hex)) return '#0f172a'
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 150 ? '#0f172a' : '#ffffff'
}

export function isDarkColor(hex) {
  return inkFor(hex) === '#ffffff'
}
