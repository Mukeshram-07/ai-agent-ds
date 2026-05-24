/**
 * ToastNotification.jsx
 * Auto-dismissing toast notification with Framer Motion.
 */
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function ToastNotification({ message, type = 'success', visible, onDismiss }) {
  const { notificationsEnabled } = useAppContext()

  useEffect(() => {
    if (visible && notificationsEnabled) {
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, notificationsEnabled, onDismiss])

  if (!notificationsEnabled) return null

  const typeConfig = {
    success: {
      icon: <CheckCircleIcon />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    error: {
      icon: <ErrorIcon />,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    info: {
      icon: <InfoIcon />,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.3)',
    },
  }

  const config = typeConfig[type] || typeConfig.success

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-sm"
          style={{
            backgroundColor: config.bg,
            border: `1px solid ${config.border}`,
            backdropFilter: 'blur(12px)',
            color: 'var(--color-text-primary)',
          }}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="alert"
          aria-live="polite"
        >
          <span style={{ color: config.color }}>{config.icon}</span>
          <span className="text-sm font-medium flex-1">{message}</span>
          <button
            onClick={onDismiss}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Dismiss notification"
          >
            <XIcon />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
