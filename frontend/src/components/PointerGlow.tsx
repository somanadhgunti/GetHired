import { motion, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'

export default function PointerGlow() {
  const x = useMotionValue(-240)
  const y = useMotionValue(-240)
  const scale = useMotionValue(0)

  useEffect(() => {
    const root = document.documentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      root.style.setProperty('--pointer-x', '50%')
      root.style.setProperty('--pointer-y', '20%')
      return undefined
    }

    const handleMove = (event: PointerEvent) => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`)
      root.style.setProperty('--pointer-y', `${event.clientY}px`)
      x.set(event.clientX - 180)
      y.set(event.clientY - 180)
      scale.set(1)
    }

    const handleDown = () => {
      scale.set(1.08)
    }

    const handleUp = () => {
      scale.set(1)
    }

    const handleBlur = () => {
      scale.set(0)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerdown', handleDown)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [scale, x, y])

  return <motion.div className="pointer-glow" style={{ x, y, scale }} aria-hidden="true" />
}
