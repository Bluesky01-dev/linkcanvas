// Deterministic seeding: same name in, same artwork out. Forever.

export function hashString(str) {
  let h = 2166136261 >>> 0
  for (const ch of str) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Small, fast, seedable PRNG (mulberry32)
export function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFrom(text) {
  return hashString((text || 'anonymous').trim().toLowerCase())
}
