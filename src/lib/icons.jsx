// Social icons from react-icons (Font Awesome 6 Free — open source),
// auto-detected from a URL's host.
import {
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaGithub,
  FaLinkedinIn,
  FaTiktok,
  FaTwitch,
  FaTelegram,
  FaWhatsapp,
  FaFacebookF,
  FaRedditAlien,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaSpotify,
  FaDiscord,
  FaEnvelope,
  FaGlobe,
} from 'react-icons/fa6'

const ICONS = {
  instagram: { icon: FaInstagram, label: 'Instagram' },
  youtube: { icon: FaYoutube, label: 'YouTube' },
  x: { icon: FaXTwitter, label: 'X' },
  github: { icon: FaGithub, label: 'GitHub' },
  linkedin: { icon: FaLinkedinIn, label: 'LinkedIn' },
  tiktok: { icon: FaTiktok, label: 'TikTok' },
  twitch: { icon: FaTwitch, label: 'Twitch' },
  telegram: { icon: FaTelegram, label: 'Telegram' },
  whatsapp: { icon: FaWhatsapp, label: 'WhatsApp' },
  facebook: { icon: FaFacebookF, label: 'Facebook' },
  reddit: { icon: FaRedditAlien, label: 'Reddit' },
  dribbble: { icon: FaDribbble, label: 'Dribbble' },
  behance: { icon: FaBehance, label: 'Behance' },
  medium: { icon: FaMedium, label: 'Medium' },
  spotify: { icon: FaSpotify, label: 'Spotify' },
  discord: { icon: FaDiscord, label: 'Discord' },
  mail: { icon: FaEnvelope, label: 'Email' },
  globe: { icon: FaGlobe, label: 'Website' },
}

const hosts = [
  ['instagram.com', 'instagram'],
  ['youtube.com', 'youtube'],
  ['youtu.be', 'youtube'],
  ['x.com', 'x'],
  ['twitter.com', 'x'],
  ['github.com', 'github'],
  ['linkedin.com', 'linkedin'],
  ['tiktok.com', 'tiktok'],
  ['twitch.tv', 'twitch'],
  ['t.me', 'telegram'],
  ['telegram.me', 'telegram'],
  ['wa.me', 'whatsapp'],
  ['whatsapp.com', 'whatsapp'],
  ['facebook.com', 'facebook'],
  ['fb.com', 'facebook'],
  ['reddit.com', 'reddit'],
  ['dribbble.com', 'dribbble'],
  ['behance.net', 'behance'],
  ['medium.com', 'medium'],
  ['spotify.com', 'spotify'],
  ['discord.gg', 'discord'],
  ['discord.com', 'discord'],
]

export function detectPlatform(url) {
  if (/^mailto:/i.test(url)) return 'mail'
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    for (const [h, id] of hosts) {
      if (host === h || host.endsWith('.' + h)) return id
    }
  } catch {
    /* not a parseable URL */
  }
  return 'globe'
}

export function SocialIcon({ url, size = 18 }) {
  const Icon = ICONS[detectPlatform(url)].icon
  return <Icon size={size} aria-hidden="true" />
}

export function platformLabel(url) {
  return ICONS[detectPlatform(url)].label
}
