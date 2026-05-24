/**
 * AIAssistant.jsx
 * Groq-powered conversational AI assistant.
 */
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { sendMessage, buildSystemPrompt } from '../utils/groqClient.js'
import GlassCard from '../components/GlassCard.jsx'
import ChatBubble from '../components/ChatBubble.jsx'
import TypingIndicator from '../components/TypingIndicator.jsx'

const SUGGESTED_QUESTIONS = [
  'Why was this model recommended for my dataset?',
  'What preprocessing steps should I apply first?',
  'How should I handle missing values in my data?',
  'What does the accuracy metric mean for my model?',
  'How can I improve my model performance?',
]

const MAX_HISTORY = 50

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export default function AIAssistant() {
  const { dataset, selectedModel } = useAppContext()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [retryMessage, setRetryMessage] = useState(null)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendUserMessage = async (content) => {
    if (!content.trim() || isTyping) return

    const userMsg = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }

    // Add user message and cap at 50
    setMessages((prev) => {
      const updated = [...prev, userMsg]
      return updated.slice(-MAX_HISTORY)
    })
    setInput('')
    setIsTyping(true)
    setError(null)
    setRetryMessage(null)

    const systemPrompt = buildSystemPrompt(dataset?.name, selectedModel?.name)

    // Build messages array for API (include new user message)
    const apiMessages = [...messages, userMsg].slice(-MAX_HISTORY).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const response = await sendMessage(apiMessages, systemPrompt)

      const aiMsg = {
        role: 'assistant',
        content: response.content,
        confidenceScore: response.confidenceScore,
        timestamp: Date.now(),
      }

      setMessages((prev) => {
        const updated = [...prev, aiMsg]
        return updated.slice(-MAX_HISTORY)
      })
    } catch (err) {
      setIsTyping(false)
      if (err.name === 'TimeoutError') {
        setError('Request timed out after 30 seconds.')
        setRetryMessage(content)
      } else if (err.name === 'NetworkError') {
        setError('Check your internet connection.')
        setRetryMessage(content)
      } else {
        setError('AI assistant temporarily unavailable.')
        setRetryMessage(content)
      }
      return
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendUserMessage(input)
  }

  const handleSuggestedQuestion = (q) => {
    sendUserMessage(q)
  }

  const handleRetry = () => {
    if (retryMessage) {
      setError(null)
      sendUserMessage(retryMessage)
    }
  }

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            AI Assistant
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Powered by Groq · {dataset ? `Dataset: ${dataset.name}` : 'No dataset loaded'}{' '}
            {selectedModel ? `· Model: ${selectedModel.name}` : ''}
          </p>
        </motion.div>

        {/* Suggested Questions */}
        {messages.length === 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Suggested Questions
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestedQuestion(q)}
                    disabled={isTyping}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Chat Area */}
        <GlassCard className="mb-4">
          <div
            className="min-h-64 max-h-[60vh] overflow-y-auto"
            style={{ minHeight: messages.length === 0 ? '200px' : 'auto' }}
          >
            {messages.length === 0 && !isTyping ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="text-4xl">💬</div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Ask me anything about your data science workflow!
                </p>
              </div>
            ) : (
              <div className="p-2">
                {messages.map((msg, i) => (
                  <ChatBubble key={i} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </GlassCard>

        {/* Error */}
        {error && (
          <motion.div
            className="mb-4 p-3 rounded-lg flex items-center justify-between"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-sm">{error}</span>
            {retryMessage && (
              <button
                onClick={handleRetry}
                className="px-3 py-1 rounded-lg text-xs font-medium ml-3"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                Retry
              </button>
            )}
          </motion.div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your data, model, or workflow..."
              disabled={isTyping}
              className="flex-1 px-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'var(--color-glass-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                backdropFilter: 'blur(8px)',
              }}
              aria-label="Chat message input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-4 py-3 rounded-xl font-medium text-white transition-all duration-200"
              style={{
                background: !input.trim() || isTyping
                  ? 'rgba(99,102,241,0.4)'
                  : 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
              }}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </form>

        {/* History count */}
        {messages.length > 0 && (
          <div className="mt-2 text-xs text-right" style={{ color: 'var(--color-text-secondary)' }}>
            {messages.length}/{MAX_HISTORY} messages
          </div>
        )}
      </div>
    </div>
  )
}
