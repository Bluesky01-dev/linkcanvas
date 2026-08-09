import GenerativeCanvas from './GenerativeCanvas.jsx'
import { themeById } from '../lib/themes.js'
import { accentFor } from '../lib/engine.js'
import { SocialIcon, platformLabel } from '../lib/icons.jsx'
import { inkFor, isDarkColor, HEX_RE } from '../lib/color.js'

// The whole public page as one presentational component —
// used full-screen by Bio and inside the phone frame by the editor preview.
export default function BioView({ profile, onLinkClick, preview = false, canvasSeed }) {
  const seed = canvasSeed ?? profile.name
  const theme = themeById(profile.theme)
  const style = { ...theme.vars }
  if (theme.id === 'prism') {
    // Prism: the name-seeded artwork also drives the accent
    style['--accent'] = accentFor(seed)
  }

  // custom button color beats the theme accent
  if (HEX_RE.test(profile.accentColor)) {
    style['--accent'] = profile.accentColor
    style['--accent-ink'] = inkFor(profile.accentColor)
    style['--accent-soft'] = profile.accentColor + '22'
  }

  // custom page color applies with the Solid background
  const customBg = profile.background === 'solid' && HEX_RE.test(profile.bgColor)
  if (customBg) {
    style['--bg'] = profile.bgColor
    if (isDarkColor(profile.bgColor)) {
      style['--text'] = '#f5f7fb'
      style['--dim'] = 'rgba(245,247,251,0.66)'
      style['--card'] = 'rgba(255,255,255,0.08)'
      style['--card-border'] = 'rgba(255,255,255,0.17)'
    } else {
      style['--text'] = '#0f172a'
      style['--dim'] = '#5b6b83'
      style['--card'] = '#ffffff'
      style['--card-border'] = 'rgba(15,23,42,0.12)'
    }
  }
  const dark = customBg ? isDarkColor(profile.bgColor) : theme.dark

  const links = profile.links.filter((l) => l.enabled)
  const initial = [...(profile.name || '?')][0]?.toUpperCase() ?? '?'

  function handleClick(e, id) {
    if (preview) {
      e.preventDefault()
      return
    }
    onLinkClick?.(id)
  }

  return (
    <div
      className={`bio bio--${dark ? 'dark' : 'light'}${preview ? ' bio--preview' : ''}`}
      style={style}
      data-shape={profile.shape}
      data-btnstyle={profile.buttonStyle}
    >
      {profile.background !== 'solid' && (
        <GenerativeCanvas seedText={seed} theme={theme} className="bio__canvas" />
      )}

      <div className="bio__card">
        {profile.avatarUrl ? (
          <img className="bio__avatar" src={profile.avatarUrl} alt="" />
        ) : (
          <div className="bio__avatar bio__avatar--mono">{initial}</div>
        )}

        <h1 className="bio__name">{profile.name}</h1>
        {profile.bio && <p className="bio__tagline">{profile.bio}</p>}

        {profile.socials.length > 0 && (
          <div className="bio__socials" aria-label="Social profiles">
            {profile.socials.map((url, i) => (
              <a
                key={i}
                className="bio__social"
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={platformLabel(url)}
                title={platformLabel(url)}
                onClick={(e) => preview && e.preventDefault()}
              >
                <SocialIcon url={url} />
              </a>
            ))}
          </div>
        )}

        <nav className="bio__links" aria-label="Links">
          {links.map((l) => (
            <a
              key={l.id ?? l.url}
              className="linkbtn"
              href={l.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => handleClick(e, l.id)}
            >
              {l.icon && <span className="linkbtn__icon">{l.icon}</span>}
              <span className="linkbtn__label">{l.label}</span>
            </a>
          ))}
          {links.length === 0 && <p className="bio__empty">No links yet — add some in the editor.</p>}
        </nav>

        <footer className="bio__footer">Made with LinkCanvas</footer>
      </div>
    </div>
  )
}
