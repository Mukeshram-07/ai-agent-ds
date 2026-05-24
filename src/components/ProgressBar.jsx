/**
 * ProgressBar.jsx
 * Animated progress bar driven by a progress prop (0–100).
 */
import { motion } from 'framer-motion'

export default function ProgressBar({ progress = 0, label = '', color = '#6366f1', height = 8 }) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {label}
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
            {clampedProgress.toFixed(0)}%
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          backgroundColor: 'var(--color-border)',
        }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, #8b5cf6)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
