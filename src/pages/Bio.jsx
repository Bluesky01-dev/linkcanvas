import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import GenerativeCanvas from '../components/GenerativeCanvas.jsx'
import { accentFor } from '../lib/engine.js'
import { api } from '../lib/api.js'

export default function Bio() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.getProfile().then(setProfile).catch(console.error)
    // count one view per browser session
    if (!sessionStorage.getItem('lc-viewed')) {
      sessionStorage.setItem('lc-viewed', '1')
      api.view()
    }
  }, [])

  if (!profile) return null

  const accent = accentFor(profile.name)

  return (
    <main className="bio" style={{ '--accent': accent }}>
      <GenerativeCanvas seedText={profile.name} className="bio__canvas" />

      <div className="bio__card">
        <div className="bio__avatar">{[...profile.name][0]?.toUpperCase() ?? '?'}</div>
        <h1 className="bio__name">{profile.name}</h1>
        {profile.bio && <p className="bio__tagline">{profile.bio}</p>}

        <nav className="bio__links" aria-label="Links">
          {profile.links.map((l) => (
            <a
              key={l.id}
              className="linkbtn"
              href={l.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => api.click(l.id)}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="bio__nav">
        <Link className="bio__navlink" to="/edit">
          ✎ Edit
        </Link>
        <Link className="bio__navlink" to="/stats">
          ↗ Stats
        </Link>
      </div>
    </main>
  )
}
