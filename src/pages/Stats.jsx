import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { accentFor } from '../lib/engine.js'
import { api } from '../lib/api.js'

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error)
    api.getProfile().then((p) => setName(p.name)).catch(() => {})
  }, [])

  if (!stats) return null

  const max = Math.max(1, ...stats.clicks.map((c) => c.count))
  const ctr = stats.views > 0 ? Math.round((stats.totalClicks / stats.views) * 100) : 0

  return (
    <main className="page" style={{ '--accent': accentFor(name) }}>
      <div className="page__top">
        <h1 className="page__title">Your numbers</h1>
        <Link className="backlink" to="/">
          ← Back to your page
        </Link>
      </div>

      <div className="stats__tiles">
        <div className="tile">
          <div className="tile__label">Page views</div>
          <div className="tile__value">{stats.views}</div>
        </div>
        <div className="tile">
          <div className="tile__label">Link clicks</div>
          <div className="tile__value">{stats.totalClicks}</div>
        </div>
        <div className="tile">
          <div className="tile__label">Click-through</div>
          <div className="tile__value">{ctr}%</div>
        </div>
      </div>

      <section className="card">
        {stats.clicks.length === 0 ? (
          <p className="empty">Add some links in the editor, then watch the clicks land here.</p>
        ) : (
          stats.clicks.map((c) => (
            <div className="statrow" key={c.id}>
              <span className="statrow__label">{c.label}</span>
              <div className="statrow__bar">
                <div className="statrow__fill" style={{ width: `${(c.count / max) * 100}%` }} />
              </div>
              <span className="statrow__count">{c.count}</span>
            </div>
          ))
        )}
      </section>
    </main>
  )
}
