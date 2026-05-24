/**
 * Settings.jsx
 * Theme toggle, accent colors, and notification preferences.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { save as saveTheme } from '../utils/themeManager.js'
import GlassCard from '../components/GlassCard.jsx'
import ToastNotification from '../components/ToastNotification.jsx'

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
]

function Toggle({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className="w-12 h-6 rounded-full transition-all duration-200"
          style={{
            backgroundColor: checked ? 'var(--color-accent)' : 'rgba(255,255,255,0.15)',
          }}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow"
            style={{ left: checked ? '28px' : '4px' }}
          />
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </span>
    </label>
  )
}

export default function Settings() {
  const { theme, accentColor, notificationsEnabled, setTheme, setAccentColor, setNotificationsEnabled } =
    useAppContext()
  const [toast, setToast] = useState({ visible: false, message: '' })

  const showToast = (message) => {
    setToast({ visible: true, message })
  }

  const handleThemeToggle = (isDark) => {
    const newTheme = isDark ? 'dark' : 'light'
    setTheme(newTheme)
    saveTheme(newTheme, accentColor, notificationsEnabled)
    showToast(`Switched to ${newTheme} mode`)
  }

  const handleAccentColor = (color) => {
    setAccentColor(color)
    saveTheme(theme, color, notificationsEnabled)
    showToast(`Accent color updated`)
  }

  const handleNotifications = (enabled) => {
    setNotificationsEnabled(enabled)
    saveTheme(theme, accentColor, enabled)
    if (enabled) showToast('Notifications enabled')
  }

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Settings
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Customize your AI Agent experience
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Theme */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Appearance
              </h3>
              <div className="space-y-4">
                <Toggle
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onChange={handleThemeToggle}
                  label={`${theme === 'dark' ? 'Dark' : 'Light'} Mode`}
                />
                <div className="flex items-center gap-3 pt-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f1f5f9', border: '2px solid var(--color-border)' }}
                  >
                    {theme === 'dark' ? '🌙' : '☀️'}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {theme === 'dark' ? 'Easy on the eyes in low light' : 'Bright and clear for daytime use'}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Accent Colors */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Accent Color
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleAccentColor(color.value)}
                    className="flex flex-col items-center gap-1.5 group"
                    title={color.name}
                    aria-label={`Set accent color to ${color.name}`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl transition-all duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: color.value,
                        boxShadow:
                          accentColor === color.value
                            ? `0 0 0 3px rgba(255,255,255,0.3), 0 0 12px ${color.value}60`
                            : 'none',
                        transform: accentColor === color.value ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {accentColor === color.value && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Notifications
              </h3>
              <Toggle
                id="notifications"
                checked={notificationsEnabled}
                onChange={handleNotifications}
                label="In-app notifications"
              />
              <p className="text-xs mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                {notificationsEnabled
                  ? 'Toast notifications are enabled. You will see confirmation messages when settings change.'
                  : 'Toast notifications are disabled. No confirmation messages will be shown.'}
              </p>
            </GlassCard>
          </motion.div>

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                About
              </h3>
              <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex justify-between">
                  <span>Version</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Model</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>Groq llama3-8b-8192</span>
                </div>
                <div className="flex justify-between">
                  <span>Framework</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>React 18 + Vite</span>
                </div>
                <div className="flex justify-between">
                  <span>Charts</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>Plotly.js</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <ToastNotification
        message={toast.message}
        type="success"
        visible={toast.visible}
        onDismiss={() => setToast({ visible: false, message: '' })}
      />
    </div>
  )
}
