import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Building2, Headset, Mail, MapPin, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { TransitionLink } from '../components/transitions/TransitionLink'
import { getErrorMessage } from '../lib/errors'
import * as publicService from '../services/publicService'

export default function HomePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('General')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null)

  const feedbackMutation = useMutation({
    mutationFn: publicService.submitFeedback,
    onSuccess: () => {
      setFeedbackNotice('Thanks for your feedback. We have received it successfully.')
      setName('')
      setEmail('')
      setTopic('General')
      setSubject('')
      setMessage('')
    },
    onError: (error) => {
      setFeedbackNotice(getErrorMessage(error))
    },
  })

  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <div className="landing-brand">
          <img src="/images/logo.png" alt="GetHired logo" className="brand-logo" />
          <div>
            <h1>GetHired</h1>
            <p>Professional hiring platform for workers and job givers</p>
          </div>
        </div>

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#home" className="landing-nav-btn">Home</a>
          <a href="#details" className="landing-nav-btn">Details</a>
          <a href="#feedback" className="landing-nav-btn">Feedback Form</a>
          <a href="#customercare" className="landing-nav-btn">Customer Care</a>
        </nav>

        <div className="landing-auth-actions">
          <TransitionLink to="/auth" variant="subtle">
            Sign In
          </TransitionLink>
          <TransitionLink to="/auth" variant="primary" withRipple glow>
            Register
          </TransitionLink>
        </div>
      </header>

      <main className="landing-main">
        <section id="home" className="landing-hero">
          <div className="landing-hero-copy">
            <p className="eyebrow">
              <Sparkles size={14} />
              Full multi-role platform
            </p>
            <h2>Everything you need for hiring, onboarding, and role-based operations.</h2>
            <p>
              Enterprise-grade hiring operations with clean user journeys, secure authentication, and dependable
              communication between workers, customers, and platform administrators.
            </p>

            <div className="landing-hero-actions">
              <TransitionLink
                className="btn primary"
                to="/auth"
                icon={<ArrowRight size={15} />}
                withRipple
                glow
              >
                Start Now
              </TransitionLink>
              <a className="btn subtle" href="#details">
                Explore Details
              </a>
            </div>

            <div className="landing-stat-grid">
              <article className="landing-stat-card">
                <strong>3</strong>
                <span>Role dashboards</span>
              </article>
              <article className="landing-stat-card">
                <strong>24/7</strong>
                <span>Platform uptime target</span>
              </article>
              <article className="landing-stat-card">
                <strong>Secure</strong>
                <span>JWT auth and protected APIs</span>
              </article>
            </div>
          </div>

          <div className="landing-hero-media">
            <img src="/images/homepage.png" alt="GetHired platform showcase" className="landing-hero-image" />
          </div>
        </section>

        <section id="details" className="landing-section">
          <div className="landing-section-head">
            <h3>Details</h3>
            <p>A complete role-based platform with practical workflows for real hiring teams.</p>
          </div>

          <div className="landing-card-grid">
            <article className="landing-detail-card">
              <UsersRound size={18} />
              <h4>Worker Experience</h4>
              <p>Search jobs with filters, open detail pages, submit resumes, and track applications.</p>
            </article>
            <article className="landing-detail-card">
              <Building2 size={18} />
              <h4>Job Giver Experience</h4>
              <p>Post jobs, update status, review applicants, and manage hiring decisions quickly.</p>
            </article>
            <article className="landing-detail-card">
              <ShieldCheck size={18} />
              <h4>Operations Control</h4>
              <p>Role-based access, secure sessions, and modular backend endpoints for growth.</p>
            </article>
          </div>
        </section>

        <section id="feedback" className="landing-section landing-feedback-wrap">
          <div className="landing-section-head">
            <h3>Feedback Form</h3>
            <p>Share feedback, feature requests, or issues. We send your message through email notifications.</p>
          </div>

          <form
            className="landing-feedback-form"
            onSubmit={(event) => {
              event.preventDefault()
              setFeedbackNotice(null)
              void feedbackMutation.mutate({ name, email, topic, subject, message })
            }}
          >
            <div className="landing-form-grid">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required />
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
            </div>

            <div className="landing-form-grid">
              <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                <option value="General">General</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Support">Support</option>
              </select>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" required />
            </div>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your feedback"
              rows={5}
              required
            />

            <button type="submit" className="btn primary" disabled={feedbackMutation.isPending}>
              {feedbackMutation.isPending ? 'Sending...' : 'Send Feedback'}
            </button>

            {feedbackNotice ? <p className="notice">{feedbackNotice}</p> : null}
          </form>
        </section>

        <section id="customercare" className="landing-section">
          <div className="landing-section-head">
            <h3>Customer Care</h3>
            <p>Reach our support team for onboarding help, troubleshooting, or enterprise assistance.</p>
          </div>

          <div className="landing-support-grid">
            <article className="landing-support-card">
              <Headset size={18} />
              <h4>Live Support Window</h4>
              <p>Monday to Saturday, 9:00 AM - 8:00 PM.</p>
            </article>
            <article className="landing-support-card">
              <Mail size={18} />
              <h4>Email</h4>
              <p>support@gethired.local</p>
            </article>
            <article className="landing-support-card">
              <MapPin size={18} />
              <h4>Operations Desk</h4>
              <p>GetHired Service Center, Hyderabad.</p>
            </article>
          </div>
        </section>

        <footer className="landing-footer">
          <p>GetHired</p>
          <span>Professional hiring workflows for workers, job givers, and operations teams.</span>
        </footer>
      </main>
    </div>
  )
}
