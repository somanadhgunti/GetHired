# Page & Component Transitions Guide

This document explains the cool transition system implemented in GetHired. All transitions are automatic and require minimal configuration! 🎨✨

## What's New

We've implemented a comprehensive transition system that makes navigation smooth and visually appealing:

1. **Automatic Page Transitions** - Smooth fade + scale animation when navigating
2. **Enhanced Button Effects** - Ripple, glow, and scale animations
3. **Staggered Content** - Elements appear with staggered timing
4. **Floating & Bounce** - Special animations for hero content
5. **Smooth Interactions** - All buttons and links have smooth transitions

## Quick Start

### The TransitionLink Component

Replace regular `<Link>` components with `<TransitionLink>`:

```tsx
import { TransitionLink } from '../components/transitions/TransitionLink'

// Basic usage
<TransitionLink to="/auth">
  Sign In
</TransitionLink>

// With options
<TransitionLink 
  to="/auth"
  variant="primary"          // primary, secondary, danger, subtle
  withRipple                 // Add ripple effect on click
  glow                       // Add glow effect on hover
  icon={<ArrowRight />}      // Add icon before text
>
  Get Started
</TransitionLink>
```

### Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | string | - | Navigation URL (required) |
| `variant` | 'primary' \| 'secondary' \| 'danger' \| 'subtle' | 'primary' | Button style variant |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | Button size |
| `fullWidth` | boolean | false | Make button 100% width |
| `icon` | React.ReactNode | - | Icon element to display |
| `withRipple` | boolean | true | Enable ripple effect on click |
| `glow` | boolean | false | Enable glow effect on hover |
| `className` | string | - | Additional CSS classes |

## 🎬 Available Animations

### Page Entry/Exit (Automatic)
```
Enter: Fade in + Scale up (0.8s)
Exit: Fade out + Scale down (0.5s)
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Button Effects

#### Ripple Effect
```tsx
<TransitionLink to="/" withRipple>
  Click me
</TransitionLink>
```
Creates expanding ripple circles on click.

#### Glow Effect
```tsx
<TransitionLink to="/" glow>
  Hover me
</TransitionLink>
```
Pulsing radial glow animation on hover.

#### Combined
```tsx
<TransitionLink to="/" withRipple glow>
  Both effects
</TransitionLink>
```

### Content Animations

#### Stagger Items
Add class `stagger-item` to elements that should appear with staggered timing:

```tsx
<div className="stagger-item">Item 1</div>
<div className="stagger-item">Item 2</div>
<div className="stagger-item">Item 3</div>
```

Timing:
- 1st item: 0.1s delay
- 2nd item: 0.2s delay
- 3rd item: 0.3s delay
- etc.

#### Floating Animation
```tsx
<img className="float" src="..." alt="..." />
```
Subtle up-down floating movement.

#### Card Entrance
```tsx
<div className="card-enter">
  <card-content />
</div>
```
Cards slide up with scale animation.

#### Bounce In
```tsx
<div className="bounce-in">
  Bouncy entrance
</div>
```

## 🎨 CSS Classes Reference

### Animations

| Class | Effect | Duration |
|-------|--------|----------|
| `stagger-item` | Staggered fade-in | 0.6s |
| `card-enter` | Card slide-up | 0.6s |
| `float` | Floating motion | 3s (infinite) |
| `bounce-in` | Bouncy entrance | 0.6s |
| `pulse` | Pulsing opacity | 2s (infinite) |
| `glow-hover` | Glow on hover | 1.5s (on hover) |
| `spinner` | Rotating spin | 1s (infinite) |

### States

| Class | Purpose |
|-------|---------|
| `has-ripple` | Enables ripple effect |
| `glow-hover` | Enables glow effect |
| `page-transition` | Page transition wrapper |
| `transitioning` | Active transition state |

## 📝 Custom Hook: useNavigateTransition

For custom navigation with transition delay:

```tsx
import { useNavigateTransition } from '../hooks/useTransitions'

export const MyComponent = () => {
  const navigateTo = useNavigateTransition({ delay: 400 })

  const handleClick = () => {
    navigateTo('/auth')
  }

  return <button onClick={handleClick}>Navigate with transition</button>
}
```

## 🪝 Custom Hook: useStaggerAnimation

For creating staggered animations programmatically:

```tsx
import { useStaggerAnimation } from '../hooks/useTransitions'

export const MyList = ({ items }) => {
  const stagger = useStaggerAnimation(items.length, 150)

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={stagger.getItemStyle(i)}>
          {item}
        </div>
      ))}
    </div>
  )
}
```

## 🎯 Implementation Examples

### Example 1: Home Page Buttons

```tsx
import { TransitionLink } from '../components/transitions/TransitionLink'
import { ArrowRight } from 'lucide-react'

export const HomePage = () => (
  <div>
    <h1>Welcome</h1>
    <TransitionLink
      to="/auth"
      variant="primary"
      withRipple
      glow
      size="large"
      icon={<ArrowRight />}
    >
      Get Started
    </TransitionLink>
  </div>
)
```

### Example 2: Staggered Card List

```tsx
export const CardList = ({ cards }) => (
  <div className="card-grid">
    {cards.map((card, i) => (
      <div key={i} className="stagger-item card-enter">
        <CardComponent {...card} />
      </div>
    ))}
  </div>
)
```

### Example 3: Hero Section

```tsx
export const Hero = () => (
  <div className="hero">
    <img src="/hero.png" className="float" alt="Hero" />
    <h1>Amazing Title</h1>
    <p>Subtitle with description</p>
    
    <TransitionLink to="/auth" variant="primary" size="large">
      Start Now
    </TransitionLink>
  </div>
)
```

## 🎛️ Customization

### Changing Animation Duration

Edit in `PageTransition.tsx`:
```tsx
// Default is 500ms for fade out
setTimeout(() => {
  setDisplayLocation(location)
  setIsTransitioning(false)
}, 500) // Change this value
```

### Changing Animation Easing

Edit in `PageTransition.css`:
```css
.page-transition {
  animation: pageEnter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* Change the cubic-bezier values */
}
```

### Adding New Animations

Add to `PageTransition.css`:
```css
@keyframes myAnimation {
  0% {
    opacity: 0;
    transform: translateX(-100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.my-animation {
  animation: myAnimation 0.6s ease-out;
}
```

## ⚡ Performance Tips

1. **Animations are GPU-accelerated** - Uses `transform` and `opacity` for best performance
2. **Minimal repaints** - Transitions don't trigger layout shifts
3. **Lightweight** - No external animation libraries needed
4. **Mobile optimized** - Touch-friendly with appropriate timing

## 🔧 Troubleshooting

### Animations not showing
- Check that `PageTransition` wrapper is in `App.tsx`
- Check that `TransitionProvider` is in `App.tsx`
- Verify CSS files are imported

### Page jumps during transition
- Increase the transition delay in `PageTransition.tsx`
- Check for render-blocking JavaScript

### Button animations not working
- Use `<TransitionLink>` instead of `<Link>`
- Verify CSS files are loaded
- Check browser DevTools for console errors

## 📚 Files Structure

```
frontend/src/
├── components/transitions/
│   ├── PageTransition.tsx        # Main transition wrapper
│   ├── PageTransition.css        # Transition animations
│   ├── TransitionLink.tsx        # Enhanced Link component
│   ├── TransitionLink.css        # Button animations
│   └── TransitionEffectsDemo.tsx # Demo component
├── context/
│   └── TransitionContext.tsx     # Transition state management
├── hooks/
│   └── useTransitions.ts         # Custom hooks
└── App.tsx                        # Updated with providers
```

## 🚀 Future Enhancements

Potential additions:
- Page-specific exit animations
- Gesture-based transitions (swipe)
- Animation presets (smooth, bouncy, fast, slow)
- Animation preferences (respects prefers-reduced-motion)
- Transition progress indicators

## 📖 Related Documentation

- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Code style guide
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System design
- [README.md](../../README.md) - Project overview

## 💡 Tips

1. **Start with subtle transitions** - Don't overuse animations
2. **Test on mobile** - Ensure animations perform well
3. **Respect user preferences** - Consider `prefers-reduced-motion`
4. **Keep animations fast** - 300-600ms is ideal
5. **Use meaningful animations** - They should enhance UX, not distract

---

**Happy transitioning!** 🎬✨

For questions or suggestions, refer to the main README or CONTRIBUTING guide.
