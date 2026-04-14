/**
 * Transition Effects Demo
 * 
 * This file documents all available transition effects and how to use them
 */

import { Heart, Zap, Star, Rocket, Gift } from 'lucide-react'
import { TransitionLink } from './TransitionLink'
import { useStaggerAnimation } from '../../hooks/useTransitions'

/**
 * AVAILABLE ANIMATIONS:
 * 
 * 1. PAGE TRANSITIONS (Automatic)
 *    - When navigating between pages, smooth fade + scale animation
 *    - Duration: 0.8s for enter, 0.5s for exit
 *    - Effect: Scale from 0.95 to 1, fade in
 * 
 * 2. BUTTON RIPPLE EFFECT
 *    - Add prop: withRipple={true}
 *    - Creates expanding ripple on click
 * 
 * 3. GLOW EFFECT
 *    - Add prop: glow={true}
 *    - Pulsing glow animation on hover
 * 
 * 4. STAGGER ANIMATIONS
 *    - Add class: stagger-item
 *    - Elements fade in with staggered timing
 * 
 * 5. FLOAT EFFECT
 *    - Add class: float
 *    - Subtle up-down floating animation
 * 
 * 6. CARD ENTRANCE
 *    - Add class: card-enter
 *    - Cards slide up with scale animation
 */

// Example component showing all transition effects
export const TransitionEffectsDemo = () => {
  const staggerItems = useStaggerAnimation(3, 150)

  return (
    <div className="transitions-demo">
      <section className="demo-section">
        <h2>Page Transitions</h2>
        <p>
          Click any button below to see smooth page transitions. The effect happens automatically
          when navigating to a new page.
        </p>

        <div className="demo-buttons">
          <TransitionLink
            to="/"
            variant="primary"
            withRipple
            icon={<Rocket size={16} />}
          >
            With Ripple Effect
          </TransitionLink>

          <TransitionLink
            to="/"
            variant="primary"
            glow
            icon={<Zap size={16} />}
          >
            With Glow Effect
          </TransitionLink>

          <TransitionLink
            to="/"
            variant="secondary"
            withRipple
            glow
            icon={<Heart size={16} />}
          >
            Both Effects
          </TransitionLink>
        </div>
      </section>

      <section className="demo-section">
        <h2>Staggered Content Animation</h2>
        <p>Elements appear with a staggered timing effect for visual interest.</p>

        <div className="demo-grid">
          <div className="stagger-item" style={staggerItems.getItemStyle(0)}>
            <div className="demo-card">
              <Star size={32} />
              <h3>Item 1</h3>
            </div>
          </div>
          <div className="stagger-item" style={staggerItems.getItemStyle(1)}>
            <div className="demo-card">
              <Gift size={32} />
              <h3>Item 2</h3>
            </div>
          </div>
          <div className="stagger-item" style={staggerItems.getItemStyle(2)}>
            <div className="demo-card">
              <Zap size={32} />
              <h3>Item 3</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>Available Classes</h2>
        <div className="demo-classes">
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Effect</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="code">stagger-item</td>
                <td>Staggered entrance animation (add to nth-child)</td>
              </tr>
              <tr>
                <td className="code">card-enter</td>
                <td>Card slide-up entrance animation</td>
              </tr>
              <tr>
                <td className="code">float</td>
                <td>Floating up-down animation</td>
              </tr>
              <tr>
                <td className="code">bounce-in</td>
                <td>Bouncy entrance animation</td>
              </tr>
              <tr>
                <td className="code">pulse</td>
                <td>Pulsing opacity animation</td>
              </tr>
              <tr>
                <td className="code">glow-hover</td>
                <td>Glowing hover effect</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default TransitionEffectsDemo
