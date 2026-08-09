import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaArrowPointer, FaChartLine, FaEye, FaPen } from 'react-icons/fa6'
import { api } from '../lib/api.js'

const TILES = [
  { key: 'views', label: 'Page views', icon: FaEye },
  { key: 'clicks', label: 'Link clicks', icon: FaArrowPointer },
  { key: 'ctr', label: 'Click-through', icon: FaChartLine },
]

export default function Stats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error)
  }, [])

  if (!stats) return null

  const maxClicks = Math.max(1, ...stats.clicks.map((c) => c.count))
  const maxDay = Math.max(1, ...stats.days.map((d) => d.views + d.clicks))
  const ctr = stats.views > 0 ? Math.round((stats.totalClicks / stats.views) * 100) : 0
  const values = { views: stats.views, clicks: stats.totalClicks, ctr: `${ctr}%` }

  return (
    <main className="page">
      <div className="page__top">
        <h1 className="page__title">Your numbers</h1>
        <div className="page__topactions">
          <Link className="backlink" to="/edit">
            <FaPen aria-hidden="true" /> Edit
          </Link>
          <Link className="backlink" to="/">
            <FaArrowLeft aria-hidden="true" /> Your page
          </Link>
        </div>
      </div>

      <div className="stats__tiles">
        {TILES.map(({ key, label, icon: Icon }) => (
          <div className="tile" key={key}>
            <div className="tile__top">
              <span className="tile__label">{label}</span>
              <span className="tile__icon">
                <Icon aria-hidden="true" />
              </span>
            </div>
            <div className="tile__value">{values[key]}</div>
          </div>
        ))}
      </div>

      <section className="card stats__section">
        <h2 className="stats__heading">Last 7 days</h2>
        <div className="weekchart" role="img" aria-label="Views and clicks per day, last 7 days">
          {stats.days.map((d) => (
            <div className="weekchart__col" key={d.day} title={`${d.day}: ${d.views} views, ${d.clicks} clicks`}>
              <div className="weekchart__bars">
                <div className="weekchart__bar weekchart__bar--views" style={{ height: `${(d.views / maxDay) * 100}%` }} />
                <div className="weekchart__bar weekchart__bar--clicks" style={{ height: `${(d.clicks / maxDay) * 100}%` }} />
              </div>
              <span className="weekchart__day">{d.day.slice(8)}</span>
            </div>
          ))}
        </div>
        <div className="weekchart__legend">
          <span className="weekchart__key weekchart__key--views">Views</span>
          <span className="weekchart__key weekchart__key--clicks">Clicks</span>
        </div>
      </section>

      <section className="card stats__section">
        <h2 className="stats__heading">Clicks per link</h2>
        {stats.clicks.length === 0 ? (
          <p className="empty">Add some links in the editor, then watch the clicks land here.</p>
        ) : (
          stats.clicks.map((c) => (
            <div className="statrow" key={c.id}>
              <span className="statrow__label">{c.label}</span>
              <div className="statrow__bar">
                <div className="statrow__fill" style={{ width: `${(c.count / maxClicks) * 100}%` }} />
              </div>
              <span className="statrow__count">{c.count}</span>
            </div>
          ))
        )}
      </section>
    </main>
  )
}
