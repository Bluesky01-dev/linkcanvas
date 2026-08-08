import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BioView from '../components/BioView.jsx'
import { api } from '../lib/api.js'

export default function Bio() {
  const [profile, setProfile] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.getProfile().then(setProfile).catch(console.error)
    if (!sessionStorage.getItem('lc-viewed')) {
      sessionStorage.setItem('lc-viewed', '1')
      api.view()
    }
  }, [])

  async function share() {
    const url = window.location.origin
    if (navigator.share) {
      try {
        await navigator.share({ title: profile.name, url })
        return
      } catch {
        /* fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  if (!profile) return null

  return (
    <div className="biopage">
      <BioView profile={profile} onLinkClick={(id) => api.click(id)} />

      <button className="biopage__share" onClick={share} aria-label="Share this page">
        {copied ? 'Copied!' : '↑ Share'}
      </button>

      <div className="biopage__nav">
        <Link className="biopage__navlink" to="/edit">
          ✎ Edit
        </Link>
        <Link className="biopage__navlink" to="/stats">
          ↗ Stats
        </Link>
      </div>
    </div>
  )
}
