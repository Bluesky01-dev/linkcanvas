import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GenerativeCanvas from '../components/GenerativeCanvas.jsx'
import { accentFor } from '../lib/engine.js'
import { api } from '../lib/api.js'

export default function Editor() {
  const [profile, setProfile] = useState(null)
  const [msg, setMsg] = useState(null) // { text, error }
  const [saving, setSaving] = useState(false)
  const [previewSeed, setPreviewSeed] = useState('')
  const debounceRef = useRef(0)

  useEffect(() => {
    api
      .getProfile()
      .then((p) => {
        setProfile(p)
        setPreviewSeed(p.name)
      })
      .catch(console.error)
  }, [])

  // debounce the artwork preview while typing a name
  function setName(name) {
    setProfile((p) => ({ ...p, name }))
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setPreviewSeed(name), 300)
  }

  function setLink(i, patch) {
    setProfile((p) => ({
      ...p,
      links: p.links.map((l, j) => (j === i ? { ...l, ...patch } : l)),
    }))
  }

  function addLink() {
    setProfile((p) => ({ ...p, links: [...p.links, { label: '', url: '' }] }))
  }

  function removeLink(i) {
    setProfile((p) => ({ ...p, links: p.links.filter((_, j) => j !== i) }))
  }

  async function save() {
    setSaving(true)
    setMsg(null)
    try {
      const fresh = await api.saveProfile(profile)
      setProfile(fresh)
      setMsg({ text: 'Saved — your page is live.' })
    } catch (err) {
      setMsg({ text: err.message, error: true })
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

  const accent = accentFor(previewSeed || profile.name)

  return (
    <main className="page" style={{ '--accent': accent }}>
      <div className="page__top">
        <h1 className="page__title">Edit your page</h1>
        <Link className="backlink" to="/">
          ← Back to your page
        </Link>
      </div>

      <div className="editor">
        <section className="card">
          <div className="field">
            <label htmlFor="name">Name — this paints your artwork</label>
            <input
              id="name"
              className="input"
              value={profile.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="field">
            <label htmlFor="bio">Bio</label>
            <input
              id="bio"
              className="input"
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="One line about you"
            />
          </div>

          <div className="field">
            <label>Links</label>
            {profile.links.map((l, i) => (
              <div className="linkrow" key={l.id ?? `new-${i}`}>
                <input
                  className="input"
                  value={l.label}
                  onChange={(e) => setLink(i, { label: e.target.value })}
                  placeholder="Label"
                  aria-label={`Link ${i + 1} label`}
                />
                <input
                  className="input"
                  value={l.url}
                  onChange={(e) => setLink(i, { url: e.target.value })}
                  placeholder="https://…"
                  aria-label={`Link ${i + 1} URL`}
                />
                <button className="btn btn--danger" onClick={() => removeLink(i)} aria-label={`Remove link ${i + 1}`}>
                  ✕
                </button>
              </div>
            ))}
            <div>
              <button className="btn btn--ghost" onClick={addLink}>
                + Add link
              </button>
            </div>
          </div>

          <div className="editor__actions">
            <button className="btn btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            {msg && <span className={`savemsg${msg.error ? ' savemsg--error' : ''}`}>{msg.text}</span>}
          </div>
        </section>

        <aside className="editor__preview">
          <div className="preview">
            <GenerativeCanvas seedText={previewSeed} className="preview__canvas" />
            <div className="preview__inner">
              <div className="preview__name">{profile.name || 'Your name'}</div>
              {profile.bio && <div className="preview__bio">{profile.bio}</div>}
            </div>
          </div>
          <p className="preview__hint">Every name paints a different artwork. Try typing yours.</p>
        </aside>
      </div>
    </main>
  )
}
