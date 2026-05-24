/**
 * ChatBubble.jsx
 * Individual chat message bubble.
 */
import { motion } from 'framer-motion'
import ConfidenceBadge from './ConfidenceBadge.jsx'

export default function ChatBubble({ message }) {
  const { role, content, confidenceScore, timestamp } = message
  const isUser = role === 'user'

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Label */}
        <div
          className={`text-xs font-medium ${isUser ? 'text-right' : 'text-left'}`}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {isUser ? 'You' : 'AI'}
        </div>

        {/* Bubble */}
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            backgroundColor: isUser
              ? 'var(--color-accent)'
              : 'var(--color-glass-bg)',
            color: isUser ? '#ffffff' : 'var(--color-text-primary)',
            border: isUser ? 'none' : '1px solid var(--color-glass-border)',
            backdropFilter: isUser ? 'none' : 'blur(8px)',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          }}
        >
          {content}
        </div>

        {/* Footer: confidence + timestamp */}
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isUser && confidenceScore !== undefined && (
            <ConfidenceBadge score={confidenceScore} />
          )}
          {timestamp && (
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
