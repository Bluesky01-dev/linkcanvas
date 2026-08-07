async function json(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export const api = {
  getProfile: () => fetch('/api/profile').then(json),

  saveProfile: (profile) =>
    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    }).then(json),

  getStats: () => fetch('/api/stats').then(json),

  // fire-and-forget beacons
  view: () => {
    fetch('/api/view', { method: 'POST', keepalive: true }).catch(() => {})
  },
  click: (id) => {
    fetch(`/api/click/${id}`, { method: 'POST', keepalive: true }).catch(() => {})
  },
}
