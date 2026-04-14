import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransition.css'

interface PageTransitionProps {
  children: React.ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setDisplayLocation(location)
        setIsTransitioning(false)
      }, 500) // Duration of fade out animation

      return () => clearTimeout(timer)
    }
  }, [location, displayLocation])

  return (
    <div className={`page-transition ${isTransitioning ? 'transitioning' : 'visible'}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ key: React.Key }>, {
            key: displayLocation.pathname,
          })
        }
        return child
      })}
    </div>
  )
}
