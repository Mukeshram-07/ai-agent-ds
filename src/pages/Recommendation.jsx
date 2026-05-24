/**
 * Recommendation.jsx
 * ML model recommendation with problem type detection and model cards.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { detectProblemType, recommendModels } from '../utils/mlSimulator.js'
import GlassCard from '../components/GlassCard.jsx'

const problemTypeConfig = {
  regression: {
    label: 'Regression',
    icon: '📈',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.15)',
    desc: 'Predict a continuous numeric value',
  },
  classification: {
    label: 'Classification',
    icon: '🏷️',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
    desc: 'Predict a categorical class label',
  },
  clustering: {
    label: 'Clustering',
    icon: '🔵',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)',
    desc: 'Discover natural groupings in data',
  },
}

function MetricBar({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-16 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-medium w-10 text-right" style={{ color: 'var(--color-text-primary)' }}>
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  )
}

function ConfusionMatrix({ matrix }) {
  if (!matrix) return null
  const labels = ['Positive', 'Negative']
  return (
    <div className="mt-3">
      <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        Confusion Matrix
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div />
        {labels.map((l) => (
          <div key={l} className="text-center font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Pred {l.slice(0, 3)}
          </div>
        ))}
        {matrix.map((row, i) => (
          <>
            <div key={`label-${i}`} className="font-medium flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
              Act {labels[i].slice(0, 3)}
            </div>
            {row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className="text-center py-2 rounded font-bold"
                style={{
                  backgroundColor: i === j ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)',
                  color: i === j ? '#10b981' : '#ef4444',
                }}
              >
                {val}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  )
}

export default function Recommendation() {
  const navigate = useNavigate()
  const { dataset, selectedModel, setSelectedModel } = useAppContext()
  const [problemType, setProblemType] = useState(null)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dataset) return
    setLoading(true)
    setTimeout(() => {
      const type = detectProblemType(dataset)
      const recs = recommendModels(dataset)
      setProblemType(type)
      setModels(recs)
      setLoading(false)
    }, 800)
  }, [dataset])

  if (!dataset) {
    return (
      <div
        className="min-h-screen p-6 md:p-8 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
      >
        <GlassCard className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Dataset Loaded
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Please upload a dataset to get model recommendations.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-2 rounded-lg font-medium text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}
          >
            Go to Upload
          </button>
        </GlassCard>
      </div>
    )
  }

  const ptConfig = problemType ? problemTypeConfig[problemType] : null

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Model Recommendation
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            AI-powered model selection for{' '}
            <strong style={{ color: 'var(--color-accent)' }}>{dataset.name}</strong>
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div
              className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>Analyzing dataset and detecting problem type...</p>
          </div>
        ) : (
          <>
            {/* Problem Type */}
            {ptConfig && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-4">
                    <div
                      className="text-4xl p-4 rounded-xl"
                      style={{ backgroundColor: ptConfig.bg }}
                    >
                      {ptConfig.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Detected Problem Type
                      </div>
                      <div className="text-2xl font-bold" style={{ color: ptConfig.color }}>
                        {ptConfig.label}
                      </div>
                      <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {ptConfig.desc} — based on the last column "{dataset.columns[dataset.columns.length - 1]?.name}"
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Model Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model, i) => {
                const isSelected = selectedModel?.id === model.id
                return (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <GlassCard
                      onClick={() => setSelectedModel(model)}
                      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2' : ''}`}
                      style={{
                        ringColor: 'var(--color-accent)',
                        border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-glass-border)',
                        boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
                      }}
                    >
                      {/* Model header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {model.name}
                          </h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: ptConfig?.bg || 'rgba(99,102,241,0.15)',
                              color: ptConfig?.color || '#a5b4fc',
                            }}
                          >
                            {model.type}
                          </span>
                        </div>
                        {isSelected && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Metrics */}
                      <div className="space-y-2 mb-4">
                        <MetricBar label="Accuracy" value={model.accuracy} />
                        <MetricBar label="Precision" value={model.precision} />
                        <MetricBar label="Recall" value={model.recall} />
                        <MetricBar label="F1 Score" value={model.f1} />
                      </div>

                      {/* Confusion Matrix */}
                      {model.confusionMatrix && <ConfusionMatrix matrix={model.confusionMatrix} />}

                      {/* Justification */}
                      <div
                        className="mt-4 p-3 rounded-lg text-xs leading-relaxed"
                        style={{
                          backgroundColor: 'rgba(99,102,241,0.05)',
                          border: '1px solid rgba(99,102,241,0.15)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {model.justification}
                      </div>

                      {/* Select button */}
                      <button
                        className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, var(--color-accent), #8b5cf6)'
                            : 'rgba(99,102,241,0.1)',
                          color: isSelected ? 'white' : 'var(--color-accent)',
                          border: isSelected ? 'none' : '1px solid rgba(99,102,241,0.3)',
                        }}
                      >
                        {isSelected ? '✓ Selected' : 'Select Model'}
                      </button>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>

            {selectedModel && (
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  onClick={() => navigate('/training')}
                  className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}
                >
                  Train {selectedModel.name} →
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
