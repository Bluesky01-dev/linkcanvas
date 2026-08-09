import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaArrowLeft,
  FaArrowDown,
  FaArrowUp,
  FaChartSimple,
  FaLink,
  FaPalette,
  FaPlus,
  FaTrashCan,
  FaUpload,
  FaUser,
  FaXmark,
} from 'react-icons/fa6'
import BioView from '../components/BioView.jsx'
import { THEMES } from '../lib/themes.js'
import { SocialIcon, platformLabel } from '../lib/icons.jsx'
import { LINK_ICONS, LinkIcon } from '../lib/linkicons.jsx'
import { api } from '../lib/api.js'

const TABS = [
  { id: 'Profile', icon: FaUser },
  { id: 'Links', icon: FaLink },
  { id: 'Design', icon: FaPalette },
]
const BACKGROUNDS = [
  { id: 'art', name: 'Animated' },
  { id: 'solid', name: 'Solid' },
]
const ACCENT_PRESETS = ['#2563eb', '#0ea5e9', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0f172a']
const BG_PRESETS = ['#ffffff', '#f6f8fc', '#fef3c7', '#dcfce7', '#e0e7ff', '#0f172a', '#1e1b4b', '#022c22']
const STYLES = [
  { id: 'solid', name: 'Solid' },
  { id: 'soft', name: 'Soft' },
  { id: 'outline', name: 'Outline' },
]
const SHAPES = [
  { id: 'rounded', name: 'Rounded' },
  { id: 'pill', name: 'Pill' },
  { id: 'square', name: 'Square' },
]

export default function Editor() {
  const [profile, setProfile] = useState(null)
  const [clicksById, setClicksById] = useState({})
  const [tab, setTab] = useState('Profile')
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pickerFor, setPickerFor] = useState(null) // link index with open icon picker
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
    api
      .getStats()
      .then((s) => setClicksById(Object.fromEntries(s.clicks.map((c) => [c.id, c.count]))))
      .catch(() => {})
  }, [])

  function patch(p) {
    setProfile((prev) => ({ ...prev, ...p }))
  }

  function setName(name) {
    patch({ name })
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setPreviewSeed(name), 300)
  }

  function setLink(i, p) {
    patch({ links: profile.links.map((l, j) => (j === i ? { ...l, ...p } : l)) })
  }

  function moveLink(i, dir) {
    const links = [...profile.links]
    const j = i + dir
    if (j < 0 || j >= links.length) return
    ;[links[i], links[j]] = [links[j], links[i]]
    patch({ links })
  }

  function setSocial(i, url) {
    patch({ socials: profile.socials.map((s, j) => (j === i ? url : s)) })
  }

  async function uploadAvatar(file) {
    if (!file) return
    setMsg(null)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await fetch('/api/avatar', { method: 'POST', body: fd })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Upload failed')
      patch({ avatarUrl: body.url })
      setMsg({ text: 'Picture uploaded — hit Save to keep it.' })
    } catch (err) {
      setMsg({ text: err.message, error: true })
    }
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

  const previewProfile = { ...profile, name: profile.name || 'Your name' }

  return (
    <main className="page">
      <div className="page__top">
        <h1 className="page__title">Edit your page</h1>
        <div className="page__topactions">
          <Link className="backlink" to="/stats">
            <FaChartSimple aria-hidden="true" /> Stats
          </Link>
          <Link className="backlink" to="/">
            <FaArrowLeft aria-hidden="true" /> Your page
          </Link>
        </div>
      </div>

      <div className="editor">
        <section>
          <div className="tabs" role="tablist">
            {TABS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                className={`tab${tab === id ? ' tab--active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon aria-hidden="true" /> {id}
              </button>
            ))}
          </div>

          {tab === 'Profile' && (
            <div className="card">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  className="input"
                  value={profile.name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <p className="field__hint">Your name also paints the animated artwork — try changing it.</p>
              </div>

              <div className="field">
                <label htmlFor="bio">Bio</label>
                <input
                  id="bio"
                  className="input"
                  value={profile.bio}
                  onChange={(e) => patch({ bio: e.target.value })}
                  placeholder="One line about you"
                />
              </div>

              <div className="field">
                <label>Profile picture</label>
                <div className="avatarrow">
                  {profile.avatarUrl ? (
                    <img className="avatarrow__img" src={profile.avatarUrl} alt="Current avatar" />
                  ) : (
                    <div className="avatarrow__img avatarrow__img--mono">
                      {[...(profile.name || '?')][0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="avatarrow__actions">
                    <label className="btn btn--ghost avatarrow__upload">
                      <FaUpload aria-hidden="true" /> Upload image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        hidden
                        onChange={(e) => uploadAvatar(e.target.files?.[0])}
                      />
                    </label>
                    {profile.avatarUrl && (
                      <button className="btn btn--ghost" onClick={() => patch({ avatarUrl: '' })}>
                        <FaXmark aria-hidden="true" /> Remove
                      </button>
                    )}
                  </div>
                </div>
                <input
                  id="avatar"
                  className="input"
                  value={profile.avatarUrl}
                  onChange={(e) => patch({ avatarUrl: e.target.value })}
                  placeholder="…or paste an image URL — empty = monogram"
                />
              </div>

              <div className="field">
                <label>Social icons</label>
                <p className="field__hint">Shown as an icon row under your bio. The icon is detected from the URL.</p>
                {profile.socials.map((url, i) => (
                  <div className="socialrow" key={i}>
                    <span className="socialrow__icon">
                      <SocialIcon url={url} size={18} />
                    </span>
                    <input
                      className="input"
                      value={url}
                      onChange={(e) => setSocial(i, e.target.value)}
                      placeholder="https://instagram.com/you"
                      aria-label={`Social ${i + 1} (${platformLabel(url)})`}
                    />
                    <button
                      className="iconbtn"
                      onClick={() => patch({ socials: profile.socials.filter((_, j) => j !== i) })}
                      aria-label="Remove social"
                    >
                      <FaXmark aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <div>
                  <button className="btn btn--ghost" onClick={() => patch({ socials: [...profile.socials, ''] })}>
                    <FaPlus aria-hidden="true" /> Add social
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'Links' && (
            <div className="card">
              {profile.links.map((l, i) => (
                <div className={`linkcard${l.enabled ? '' : ' linkcard--off'}`} key={l.id ?? `new-${i}`}>
                  <div className="linkcard__reorder">
                    <button className="iconbtn" onClick={() => moveLink(i, -1)} disabled={i === 0} aria-label="Move up">
                      <FaArrowUp aria-hidden="true" />
                    </button>
                    <button
                      className="iconbtn"
                      onClick={() => moveLink(i, 1)}
                      disabled={i === profile.links.length - 1}
                      aria-label="Move down"
                    >
                      <FaArrowDown aria-hidden="true" />
                    </button>
                  </div>
                  <div className="linkcard__fields">
                    <div className="linkcard__row">
                      <button
                        className={`iconpick__trigger${l.icon ? '' : ' iconpick__trigger--empty'}`}
                        onClick={() => setPickerFor(pickerFor === i ? null : i)}
                        aria-label={`Link ${i + 1} icon`}
                        aria-expanded={pickerFor === i}
                        title="Choose an icon"
                      >
                        {l.icon ? <LinkIcon value={l.icon} /> : <FaPlus aria-hidden="true" />}
                      </button>
                      <input
                        className="input"
                        value={l.label}
                        onChange={(e) => setLink(i, { label: e.target.value })}
                        placeholder="Label"
                        aria-label={`Link ${i + 1} label`}
                      />
                    </div>
                    {pickerFor === i && (
                      <div className="iconpick">
                        <div className="iconpick__grid">
                          <button
                            className={`iconpick__opt${!l.icon ? ' iconpick__opt--active' : ''}`}
                            onClick={() => {
                              setLink(i, { icon: '' })
                              setPickerFor(null)
                            }}
                            title="No icon"
                            aria-label="No icon"
                          >
                            <FaXmark aria-hidden="true" />
                          </button>
                          {Object.entries(LINK_ICONS).map(([key, { icon: Icon, label }]) => (
                            <button
                              key={key}
                              className={`iconpick__opt${l.icon === `fa:${key}` ? ' iconpick__opt--active' : ''}`}
                              onClick={() => {
                                setLink(i, { icon: `fa:${key}` })
                                setPickerFor(null)
                              }}
                              title={label}
                              aria-label={label}
                            >
                              <Icon aria-hidden="true" />
                            </button>
                          ))}
                        </div>
                        <input
                          className="input iconpick__emoji"
                          value={l.icon.startsWith('fa:') ? '' : l.icon}
                          onChange={(e) => setLink(i, { icon: e.target.value })}
                          placeholder="…or type an emoji 🔗"
                          aria-label={`Link ${i + 1} custom emoji`}
                        />
                      </div>
                    )}
                    <input
                      className="input"
                      value={l.url}
                      onChange={(e) => setLink(i, { url: e.target.value })}
                      placeholder="https://…"
                      aria-label={`Link ${i + 1} URL`}
                    />
                    {clicksById[l.id] > 0 && <span className="linkcard__clicks">{clicksById[l.id]} clicks</span>}
                  </div>
                  <div className="linkcard__side">
                    <label className="switch" title={l.enabled ? 'Visible' : 'Hidden'}>
                      <input
                        type="checkbox"
                        checked={!!l.enabled}
                        onChange={(e) => setLink(i, { enabled: e.target.checked ? 1 : 0 })}
                        aria-label={`Link ${i + 1} visible`}
                      />
                      <span className="switch__track" />
                    </label>
                    <button
                      className="iconbtn"
                      onClick={() => patch({ links: profile.links.filter((_, j) => j !== i) })}
                      aria-label={`Delete link ${i + 1}`}
                    >
                      <FaTrashCan aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="btn btn--ghost"
                onClick={() => patch({ links: [...profile.links, { label: '', url: '', icon: '', enabled: 1 }] })}
              >
                <FaPlus aria-hidden="true" /> Add link
              </button>
            </div>
          )}

          {tab === 'Design' && (
            <div className="card">
              <div className="field">
                <label>Theme</label>
                <div className="themegrid">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      className={`themecard${profile.theme === t.id ? ' themecard--active' : ''}`}
                      onClick={() => patch({ theme: t.id })}
                      aria-pressed={profile.theme === t.id}
                    >
                      <span
                        className="themecard__swatch"
                        style={{
                          background: t.canvas
                            ? `linear-gradient(135deg, ${t.canvas.bg[0]} 40%, ${t.canvas.colors[0]})`
                            : 'linear-gradient(135deg, #10002b, #ff6b35, #00f5d4)',
                        }}
                      />
                      <span className="themecard__name">{t.name}</span>
                    </button>
                  ))}
                </div>
                <p className="field__hint">Prism paints the palette from your name — every name is different.</p>
              </div>

              <div className="field">
                <label>Background</label>
                <div className="seg">
                  {BACKGROUNDS.map((b) => (
                    <button
                      key={b.id}
                      className={`seg__opt${profile.background === b.id ? ' seg__opt--active' : ''}`}
                      onClick={() => patch({ background: b.id })}
                      aria-pressed={profile.background === b.id}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
                <p className="field__hint">Solid uses the theme's plain background color — no artwork.</p>
              </div>

              {profile.background === 'solid' && (
                <div className="field">
                  <label>Background color</label>
                  <div className="swatches">
                    <button
                      className={`swatch swatch--none${!profile.bgColor ? ' swatch--active' : ''}`}
                      onClick={() => patch({ bgColor: '' })}
                      title="Theme default"
                      aria-label="Theme default background"
                    >
                      <FaXmark aria-hidden="true" />
                    </button>
                    {BG_PRESETS.map((c) => (
                      <button
                        key={c}
                        className={`swatch${profile.bgColor === c ? ' swatch--active' : ''}`}
                        style={{ background: c }}
                        onClick={() => patch({ bgColor: c })}
                        aria-label={`Background ${c}`}
                      />
                    ))}
                    <label className="swatch swatch--custom" title="Custom color">
                      <input
                        type="color"
                        value={profile.bgColor || '#f6f8fc'}
                        onChange={(e) => patch({ bgColor: e.target.value })}
                        aria-label="Custom background color"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="field">
                <label>Button color</label>
                <div className="swatches">
                  <button
                    className={`swatch swatch--none${!profile.accentColor ? ' swatch--active' : ''}`}
                    onClick={() => patch({ accentColor: '' })}
                    title="Theme default"
                    aria-label="Theme default button color"
                  >
                    <FaXmark aria-hidden="true" />
                  </button>
                  {ACCENT_PRESETS.map((c) => (
                    <button
                      key={c}
                      className={`swatch${profile.accentColor === c ? ' swatch--active' : ''}`}
                      style={{ background: c }}
                      onClick={() => patch({ accentColor: c })}
                      aria-label={`Button color ${c}`}
                    />
                  ))}
                  <label className="swatch swatch--custom" title="Custom color">
                    <input
                      type="color"
                      value={profile.accentColor || '#2563eb'}
                      onChange={(e) => patch({ accentColor: e.target.value })}
                      aria-label="Custom button color"
                    />
                  </label>
                </div>
                <p className="field__hint">
                  The first swatch follows the theme. Custom colors keep text readable automatically.
                </p>
              </div>

              <div className="field">
                <label>Button style</label>
                <div className="seg">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      className={`seg__opt${profile.buttonStyle === s.id ? ' seg__opt--active' : ''}`}
                      onClick={() => patch({ buttonStyle: s.id })}
                      aria-pressed={profile.buttonStyle === s.id}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Corners</label>
                <div className="seg">
                  {SHAPES.map((s) => (
                    <button
                      key={s.id}
                      className={`seg__opt${profile.shape === s.id ? ' seg__opt--active' : ''}`}
                      onClick={() => patch({ shape: s.id })}
                      aria-pressed={profile.shape === s.id}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="editor__actions">
            <button className="btn btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {msg && <span className={`savemsg${msg.error ? ' savemsg--error' : ''}`}>{msg.text}</span>}
          </div>
        </section>

        <aside className="editor__preview">
          <div className="phone">
            <BioView profile={previewProfile} canvasSeed={previewSeed || previewProfile.name} preview />
          </div>
          <p className="preview__hint">Live preview — saves apply to your real page.</p>
        </aside>
      </div>
    </main>
  )
}
