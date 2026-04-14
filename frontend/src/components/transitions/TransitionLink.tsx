import React, { useRef } from 'react'
import type { LinkProps } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useRippleEffect } from '../../hooks/useTransitions'
import './TransitionLink.css'

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'subtle'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  icon?: React.ReactNode
  withRipple?: boolean
  glow?: boolean
}

/**
 * Enhanced Link component with cool transition effects
 * Automatically adds animations when navigating between pages
 */
export const TransitionLink = React.forwardRef<
  HTMLAnchorElement,
  TransitionLinkProps
>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      icon,
      withRipple = true,
      glow = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleRipple = useRippleEffect()
    const linkRef = useRef<HTMLAnchorElement>(null)

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (withRipple) {
        handleRipple(e)
      }

      // Add scale animation on click
      const link = linkRef.current || (ref as any)?.current
      if (link && !link.classList.contains('clicking')) {
        link.classList.add('clicking')
        setTimeout(() => {
          link?.classList.remove('clicking')
        }, 400)
      }

      props.onClick?.(e)
    }

    const classNames = [
      'transition-link',
      `btn`,
      `btn-${variant}`,
      `btn-${size}`,
      fullWidth && 'full-width',
      glow && 'glow-hover',
      withRipple && 'has-ripple',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Link
        ref={ref || linkRef}
        className={classNames}
        onClick={handleClick}
        {...props}
      >
        {icon && <span className="link-icon">{icon}</span>}
        <span className="link-content">{children}</span>
      </Link>
    )
  }
)

TransitionLink.displayName = 'TransitionLink'
