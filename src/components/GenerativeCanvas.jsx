import { useEffect, useRef } from 'react'
import { mountScene } from '../lib/engine.js'

export default function GenerativeCanvas({ seedText, className }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctrl = mountScene(ref.current, seedText)
    return () => ctrl.destroy()
  }, [seedText])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
