/**
 * TypingIndicator.jsx
 * Animated three-dot typing indicator.
 */
import { motion } from 'framer-motion'

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -6 },
}

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex flex-col gap-1 items-start">
        <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          AI
        </div>
        <div
          className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
          style={{
            backgroundColor: 'var(--color-glass-bg)',
            border: '1px solid var(--color-glass-border)',
            backdropFilter: 'blur(8px)',
            borderRadius: '18px 18px 18px 4px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 0.4,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
