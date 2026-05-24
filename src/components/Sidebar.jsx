/**
 * Sidebar.jsx
 * Persistent left navigation with mobile hamburger support.
 */
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  cleaning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="7" cy="6" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="17" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
  eda: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  recommendation: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  training: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  code: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  assistant: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  export: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </svg>
  ),
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: icons.dashboard },
  { path: '/upload', label: 'Dataset Upload', icon: icons.upload },
  { path: '/cleaning', label: 'Data Cleaning', icon: icons.cleaning },
  { path: '/eda', label: 'EDA', icon: icons.eda },
  { path: '/recommendation', label: 'Model Recommendation', icon: icons.recommendation },
  { path: '/training', label: 'Training', icon: icons.training },
  { path: '/code', label: 'Code Generator', icon: icons.code },
  { path: '/assistant', label: 'AI Assistant', icon: icons.assistant },
  { path: '/export', label: 'Model Export', icon: icons.export },
  { path: '/settings', label: 'Settings', icon: icons.settings },
]

function HamburgerIcon({ isOpen }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {isOpen ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              AI Agent
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Data Scientists
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'font-bold'
                      : 'font-normal hover:opacity-80'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                })}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
          AI Agent v1.0.0
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger button */}
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-lg glass"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          <HamburgerIcon isOpen={mobileOpen} />
        </button>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed left-0 top-0 bottom-0 z-50 w-72"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderRight: '1px solid var(--color-border)' }}
                initial={{ x: -288 }}
                animate={{ x: 0 }}
                exit={{ x: -288 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className="hidden md:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {sidebarContent}
    </aside>
  )
}
