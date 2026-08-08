import { useEffect, useRef } from 'react'
import { mountScene } from '../lib/engine.js'

// theme: a theme object from themes.js. theme.canvas === null means
// "Prism" — the palette comes from the name-seed instead.
export default function GenerativeCanvas({ seedText, theme, className }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctrl = mountScene(ref.current, seedText, theme?.canvas ?? null, theme?.dark ?? true)
    return () => ctrl.destroy()
  }, [seedText, theme])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
