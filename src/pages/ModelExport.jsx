/**
 * ModelExport.jsx
 * Export trained model artifacts and generate FastAPI code.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { exportPickle, exportJoblib, generateFastAPICode, downloadReport } from '../utils/exportUtils.js'
import GlassCard from '../components/GlassCard.jsx'
import CodeBlock from '../components/CodeBlock.jsx'

function ExportCard({ icon, title, description, buttonLabel, onClick, disabled, color = '#6366f1' }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleClick = async () => {
    if (disabled || loading) return
    setLoading(true)
    try {
      await onClick()
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="flex flex-col gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      </div>
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="mt-auto py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
        style={{
          background: disabled
            ? 'rgba(99,102,241,0.2)'
            : done
            ? 'rgba(16,185,129,0.3)'
            : `linear-gradient(135deg, ${color}, #8b5cf6)`,
          color: disabled ? 'var(--color-text-secondary)' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Exporting...' : done ? '✓ Downloaded!' : buttonLabel}
      </button>
    </GlassCard>
  )
}

export default function ModelExport() {
  const navigate = useNavigate()
  const { dataset, cleaningSteps, selectedModel, trainingResults } = useAppContext()
  const [showFastAPI, setShowFastAPI] = useState(false)
  const fastAPICode = dataset ? generateFastAPICode(dataset, selectedModel) : ''

  if (!trainingResults) {
    return (
      <div
        className="min-h-screen p-6 md:p-8 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
      >
        <GlassCard className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Training Results
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Complete model training before exporting.
          </p>
          <button
            onClick={() => navigate('/training')}
            className="px-6 py-2 rounded-lg font-medium text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}
          >
            Go to Training
          </button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Model Export
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Export your trained{' '}
            <strong style={{ color: 'var(--color-accent)' }}>{selectedModel?.name}</strong> model
          </p>
        </motion.div>

        {/* Training Summary */}
        <GlassCard className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Model', value: selectedModel?.name || 'N/A' },
              { label: 'Accuracy', value: `${(trainingResults.finalAccuracy * 100).toFixed(2)}%` },
              { label: 'Dataset', value: dataset?.name || 'N/A' },
              { label: 'Cleaning Steps', value: cleaningSteps.length },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.label}
                </div>
                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Export Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ExportCard
            icon="🥒"
            title="Export as Pickle"
            description="Download the trained model as a .pkl file for use with Python's pickle module."
            buttonLabel="Download .pkl"
            onClick={() => exportPickle(dataset, selectedModel)}
            color="#6366f1"
          />
          <ExportCard
            icon="⚡"
            title="Export as Joblib"
            description="Download the model as a .joblib file — optimized for scikit-learn models."
            buttonLabel="Download .joblib"
            onClick={() => exportJoblib(dataset, selectedModel)}
            color="#8b5cf6"
          />
          <ExportCard
            icon="🚀"
            title="FastAPI Endpoint"
            description="Generate a production-ready FastAPI endpoint with Pydantic input validation."
            buttonLabel="Generate Code"
            onClick={() => setShowFastAPI(true)}
            color="#10b981"
          />
          <ExportCard
            icon="📄"
            title="Model Report"
            description="Download a comprehensive plain-text report with all metrics and pipeline details."
            buttonLabel="Download Report"
            onClick={() => downloadReport(dataset, cleaningSteps, selectedModel, trainingResults)}
            color="#f59e0b"
          />
        </div>

        {/* FastAPI Code */}
        {showFastAPI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  FastAPI Endpoint Code
                </h3>
                <button
                  onClick={() => setShowFastAPI(false)}
                  className="text-sm px-3 py-1 rounded-lg"
                  style={{ color: 'var(--color-text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  Hide
                </button>
              </div>
              <CodeBlock
                code={fastAPICode}
                language="python"
                filename={`${dataset?.name || 'model'}_api.py`}
                label="FastAPI Endpoint"
              />
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
