/**
 * CodeGenerator.jsx
 * Auto-generates Python code sections for the data science pipeline.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { generate } from '../utils/codeGenerator.js'
import GlassCard from '../components/GlassCard.jsx'
import CodeBlock from '../components/CodeBlock.jsx'

export default function CodeGenerator() {
  const { dataset, cleaningSteps, selectedModel } = useAppContext()
  const [sections, setSections] = useState([])
  const [error, setError] = useState(null)
  const [prevSections, setPrevSections] = useState([])

  useEffect(() => {
    try {
      const generated = generate({ dataset, cleaningSteps, selectedModel })
      setPrevSections(generated)
      setSections(generated)
      setError(null)
    } catch (err) {
      setError(err.message)
      setSections(prevSections) // Preserve previous code on error
    }
  }, [dataset, cleaningSteps, selectedModel])

  const filename = dataset?.name ? `${dataset.name}_pipeline.py` : 'pipeline.py'

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Python Code Generator
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Auto-generated pipeline code
            {dataset ? ` for ${dataset.name}` : ' — upload a dataset to customize'}
          </p>
        </motion.div>

        {/* Status bar */}
        <GlassCard className="mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dataset ? '#10b981' : '#94a3b8' }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Dataset: {dataset ? dataset.name : 'Not loaded'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cleaningSteps.length > 0 ? '#10b981' : '#94a3b8' }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Cleaning steps: {cleaningSteps.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedModel ? '#10b981' : '#94a3b8' }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Model: {selectedModel ? selectedModel.name : 'Not selected'}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Error */}
        {error && (
          <motion.div
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Code generation error: {error}
          </motion.div>
        )}

        {/* Code Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                      color: 'white',
                    }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {section.label}
                  </h3>
                </div>
                <CodeBlock
                  code={section.code}
                  language="python"
                  filename={filename}
                  label={section.label}
                />
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Download All */}
        {sections.length > 0 && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => {
                const allCode = sections.map((s) => `# ─── ${s.label} ───\n\n${s.code}`).join('\n\n')
                const blob = new Blob([allCode], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}
            >
              Download Complete Pipeline
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
