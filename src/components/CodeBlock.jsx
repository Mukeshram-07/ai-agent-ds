/**
 * CodeBlock.jsx
 * Syntax-highlighted code block with copy and download buttons.
 */
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { downloadBlob } from '../utils/exportUtils.js'

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export default function CodeBlock({ code = '', language = 'python', filename = 'pipeline.py', label = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    downloadBlob(blob, filename)
  }

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          {label && (
            <span className="text-xs font-medium ml-2" style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
              color: copied ? '#10b981' : 'var(--color-text-secondary)',
            }}
            aria-label="Copy code"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="Download code"
          >
            <DownloadIcon />
            Download
          </button>
        </div>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.875rem',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
        showLineNumbers
        wrapLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
