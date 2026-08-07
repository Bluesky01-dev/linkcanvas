// Storage layer. Prefers SQLite (a real database file in ./data).
// If better-sqlite3 isn't available on this machine, falls back to a JSON
// file store with the exact same interface, so the app runs anywhere.

let store
try {
  store = (await import('./store-sqlite.js')).store
  console.log('Storage: SQLite (data/linkcanvas.db)')
} catch (err) {
  store = (await import('./store-json.js')).store
  console.log('Storage: JSON file fallback (data/linkcanvas.json) —', err.message)
}

export { store }
