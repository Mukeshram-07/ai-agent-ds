/**
 * PageTransition.jsx
 * Framer Motion page wrapper with entrance/exit animations.
 */
import { motion, useReducedMotion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function PageTransition({ children }) {
  const shouldReduceMotion = useReducedMotion()
  const activeVariants = shouldReduceMotion ? reducedVariants : variants

  return (
    <motion.div
      variants={activeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: 'easeInOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}
