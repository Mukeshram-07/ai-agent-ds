/**
 * themeManager.js
 * Manages theme persistence via localStorage and CSS variable injection.
 */

const THEME_KEY = 'aidatascientist_theme'
const ACCENT_KEY = 'aidatascientist_accent'
const NOTIFICATIONS_KEY = 'aidatascientist_notifications'

const DARK_VARS = {
  '--color-bg-primary': '#0f0f1a',
  '--color-bg-secondary': '#1a1a2e',
  '--color-text-primary': '#f1f5f9',
  '--color-text-secondary': '#94a3b8',
  '--color-border': 'rgba(255, 255, 255, 0.1)',
  '--color-glass-bg': 'rgba(255, 255, 255, 0.05)',
  '--color-glass-border': 'rgba(255, 255, 255, 0.1)',
}

const LIGHT_VARS = {
  '--color-bg-primary': '#f8fafc',
  '--color-bg-secondary': '#f1f5f9',
  '--color-text-primary': '#0f172a',
  '--color-text-secondary': '#475569',
  '--color-border': 'rgba(0, 0, 0, 0.1)',
  '--color-glass-bg': 'rgba(255, 255, 255, 0.7)',
  '--color-glass-border': 'rgba(0, 0, 0, 0.1)',
}

/**
 * Save theme preferences to localStorage.
 * Silently swallows errors (private browsing, quota exceeded).
 */
export function save(theme, accentColor, notificationsEnabled) {
  try {
    localStorage.setItem(THEME_KEY, theme)
    localStorage.setItem(ACCENT_KEY, accentColor)
    if (notificationsEnabled !== undefined) {
      localStorage.setItem(NOTIFICATIONS_KEY, String(notificationsEnabled))
    }
  } catch {
    // Silently swallow localStorage errors
  }
}

/**
 * Load theme preferences from localStorage.
 * Returns defaults on any error.
 */
export function load() {
  try {
    const theme = localStorage.getItem(THEME_KEY) || 'dark'
    const accentColor = localStorage.getItem(ACCENT_KEY) || '#6366f1'
    const notificationsStr = localStorage.getItem(NOTIFICATIONS_KEY)
    const notificationsEnabled = notificationsStr === null ? true : notificationsStr === 'true'
    return { theme, accentColor, notificationsEnabled }
  } catch {
    return { theme: 'dark', accentColor: '#6366f1', notificationsEnabled: true }
  }
}

/**
 * Apply theme by injecting CSS custom properties onto document.documentElement.
 */
export function apply(theme, accentColor) {
  const root = document.documentElement
  const vars = theme === 'light' ? LIGHT_VARS : DARK_VARS

  // Apply theme-specific variables
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Apply accent color
  if (accentColor) {
    root.style.setProperty('--color-accent', accentColor)
  }

  // Set data-theme attribute for CSS selectors
  root.setAttribute('data-theme', theme)
}

export default { save, load, apply }
