/**
 * StatCard.jsx
 * Animated counter stat card.
 */
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard.jsx'

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const frameRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (target === 0) {
      setCount(0)
      return
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return count
}

export default function StatCard({ value, label, icon, suffix = '', delay = 0, color = 'accent' }) {
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0
  const count = useCountUp(numericValue, 2500)

  const colorMap = {
    accent: 'text-indigo-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
  }

  const bgMap = {
    accent: 'bg-indigo-500/10',
    success: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    error: 'bg-red-500/10',
    purple: 'bg-purple-500/10',
    blue: 'bg-blue-500/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <GlassCard className="flex items-center gap-4">
        {icon && (
          <div className={`p-3 rounded-lg ${bgMap[color] || bgMap.accent}`}>
            <span className={`${colorMap[color] || colorMap.accent}`}>{icon}</span>
          </div>
        )}
        <div>
          <div className={`text-2xl font-bold ${colorMap[color] || colorMap.accent}`}>
            {typeof value === 'string' && isNaN(parseInt(value))
              ? value
              : `${count.toLocaleString()}${suffix}`}
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
