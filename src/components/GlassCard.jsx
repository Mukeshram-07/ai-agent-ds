/**
 * GlassCard.jsx
 * Glassmorphism card wrapper component.
 */
import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  animate = false,
  delay = 0,
  onClick,
  style = {},
  ...props
}) {
  const baseClasses = `
    glass
    rounded-xl
    p-6
    ${onClick ? 'cursor-pointer card-hover' : ''}
    ${className}
  `.trim()

  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        onClick={onClick}
        style={style}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} onClick={onClick} style={style} {...props}>
      {children}
    </div>
  )
}
