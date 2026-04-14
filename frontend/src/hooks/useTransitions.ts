import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseNavigateTransitionOptions {
  delay?: number
}

export const useNavigateTransition = (options: UseNavigateTransitionOptions = {}) => {
  const navigate = useNavigate()
  const { delay = 300 } = options
  const isTransitioningRef = useRef(false)

  const navigateTo = useCallback(
    (path: string) => {
      if (isTransitioningRef.current) return

      isTransitioningRef.current = true

      // Add visual feedback
      document.body.style.pointerEvents = 'none'

      setTimeout(() => {
        navigate(path)
        document.body.style.pointerEvents = 'auto'
        isTransitioningRef.current = false
      }, delay)
    },
    [navigate, delay]
  )

  return navigateTo
}

/**
 * Custom hook to add ripple effect to buttons on click
 */
export const useRippleEffect = () => {
  const handleRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget
    const ripple = document.createElement('span')

    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    ripple.className = 'ripple-effect'
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    button.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)
  }, [])

  return handleRipple
}

/**
 * Custom hook to create staggered animations for arrays of items
 */
export const useStaggerAnimation = (_itemCount?: number, delayBetween: number = 100) => {
  return {
    getItemStyle: (index: number) => ({
      animation: `staggerEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`,
      animationFillMode: 'both',
      animationDelay: `${index * delayBetween}ms`,
    }),
  }
}
