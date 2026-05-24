/**
 * Landing.jsx
 * Hero landing page with animated stats and SVG illustration.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { sampleDataset } from '../data/sampleDataset.js'
import StatCard from '../components/StatCard.jsx'
import GlassCard from '../components/GlassCard.jsx'

// ─── SVG Illustration ─────────────────────────────────────────────────────────

function AIIllustration() {
  return (
    <svg viewBox="0 0 500 400" className="w-full max-w-lg" aria-label="AI data science illustration">
      {/* Background glow */}
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      <ellipse cx="250" cy="200" rx="200" ry="160" fill="url(#glow)" />

      {/* Dataset table */}
      <g transform="translate(30, 40)">
        <rect x="0" y="0" width="160" height="120" rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
        <rect x="0" y="0" width="160" height="28" rx="8" fill="rgba(99,102,241,0.3)" />
        <text x="80" y="18" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="600">Dataset</text>
        {[0,1,2,3].map((i) => (
          <g key={i} transform={`translate(0, ${28 + i * 23})`}>
            <rect x="8" y="4" width="40" height="14" rx="3" fill="rgba(99,102,241,0.2)" />
            <rect x="56" y="4" width="50" height="14" rx="3" fill="rgba(139,92,246,0.2)" />
            <rect x="114" y="4" width="38" height="14" rx="3" fill="rgba(236,72,153,0.2)" />
          </g>
        ))}
      </g>

      {/* Bar chart */}
      <g transform="translate(220, 30)">
        <rect x="0" y="0" width="160" height="130" rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
        <text x="80" y="18" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="600">Analytics</text>
        {[60, 90, 45, 75, 55].map((h, i) => (
          <rect key={i} x={15 + i * 28} y={130 - h} width="20" height={h - 30} rx="3" fill="url(#barGrad)" opacity="0.8" />
        ))}
        <line x1="10" y1="100" x2="150" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </g>

      {/* ML Model node */}
      <g transform="translate(130, 200)">
        <circle cx="60" cy="60" r="50" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.5)" strokeWidth="2" />
        <text x="60" y="55" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="600">ML Model</text>
        <text x="60" y="70" textAnchor="middle" fill="#c4b5fd" fontSize="9">Random Forest</text>
        {/* Neural network dots */}
        {[0,1,2].map((i) => (
          <circle key={i} cx={35 + i * 25} cy="85" r="4" fill="#6366f1" opacity="0.7" />
        ))}
      </g>

      {/* Line chart */}
      <g transform="translate(250, 200)">
        <rect x="0" y="0" width="160" height="110" rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
        <text x="80" y="18" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="600">Training</text>
        <polyline
          points="15,80 40,65 65,50 90,40 115,32 140,25"
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="15,85 40,78 65,72 90,68 115,65 140,62"
          fill="none"
          stroke="rgba(236,72,153,0.5)"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />
      </g>

      {/* Connecting arrows */}
      <path d="M190 100 Q205 150 190 200" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow)" />
      <path d="M220 165 Q235 185 250 200" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* Floating particles */}
      {[
        { cx: 420, cy: 80, r: 4 },
        { cx: 450, cy: 150, r: 3 },
        { cx: 400, cy: 200, r: 5 },
        { cx: 60, cy: 300, r: 4 },
        { cx: 100, cy: 350, r: 3 },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#6366f1" opacity="0.4" />
      ))}
    </svg>
  )
}

// ─── Feature Cards ────────────────────────────────────────────────────────────

const features = [
  { icon: '📊', title: 'Smart EDA', desc: 'Interactive Plotly charts with AI-powered insights' },
  { icon: '🤖', title: 'Auto ML', desc: 'Automatic model recommendation and training simulation' },
  { icon: '💬', title: 'AI Assistant', desc: 'Groq-powered conversational guidance for your workflow' },
  { icon: '🐍', title: 'Code Gen', desc: 'Auto-generated Python pipeline code ready to deploy' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()
  const { setDataset } = useAppContext()
  const [demoError, setDemoError] = useState(null)
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleTryDemo = async () => {
    setLoadingDemo(true)
    setDemoError(null)
    try {
      await new Promise((r) => setTimeout(r, 500)) // Simulate loading
      setDataset(sampleDataset)
      navigate('/upload')
    } catch (err) {
      setDemoError('Failed to load demo dataset. Please try again.')
    } finally {
      setLoadingDemo(false)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 50%, #1e1b4b 100%)',
      }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-12 md:px-12 md:pt-24">
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  backgroundColor: 'rgba(99,102,241,0.2)',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}
              >
                ✨ AI-Powered Data Science Platform
              </span>
            </motion.div>

            <motion.h1
              className="text-gradient mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              AI Agent for Data Scientists
            </motion.h1>

            <motion.h2
              className="text-xl font-medium mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              A Web-Based Intelligent Assistant
            </motion.h2>

            <motion.p
              className="text-lg mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              From raw data to deployable insight
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}
              >
                Upload Dataset
              </button>
              <button
                onClick={handleTryDemo}
                disabled={loadingDemo}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 glass"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {loadingDemo ? 'Loading...' : 'Try Demo'}
              </button>
            </motion.div>

            {demoError && (
              <motion.p
                className="mt-3 text-sm"
                style={{ color: 'var(--color-error)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {demoError}
              </motion.p>
            )}
          </div>

          {/* Illustration */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AIIllustration />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              value={12847}
              label="Datasets Processed"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              }
              delay={0.1}
              color="accent"
            />
            <StatCard
              value={38291}
              label="AI Recommendations Generated"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
              delay={0.2}
              color="purple"
            />
            <StatCard
              value={9543}
              label="Models Trained"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
              delay={0.3}
              color="success"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-12 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-2xl font-bold text-center mb-8"
            style={{ color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Everything you need for data science
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <GlassCard key={f.title} animate delay={0.1 * i + 0.5}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {f.desc}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-12 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <GlassCard animate delay={0.6}>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Ready to get started?
            </h2>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Upload your CSV or Excel dataset and let AI guide you through the complete data science workflow.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              Start with Your Data →
            </button>
          </GlassCard>
        </div>
      </section>
    </div>
  )
}
