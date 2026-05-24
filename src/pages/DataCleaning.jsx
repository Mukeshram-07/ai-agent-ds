/**
 * DataCleaning.jsx
 * Auto-detect issues, show recommendations, apply cleaning operations.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { getRecommendations } from '../utils/dataAnalyzer.js'
import { applyCleaningStep } from '../utils/mlSimulator.js'
import GlassCard from '../components/GlassCard.jsx'
import DataPreviewTable from '../components/DataPreviewTable.jsx'
import StatCard from '../components/StatCard.jsx'

const operationLabels = {
  remove_nulls: 'Remove Nulls',
  fill_missing: 'Fill Missing Values',
  standardize: 'Standardization',
  normalize: 'Normalization',
  label_encode: 'Label Encoding',
  one_hot_encode: 'One Hot Encoding',
}

const operationColors = {
  remove_nulls: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  fill_missing: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  standardize: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc' },
  normalize: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  label_encode: { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd' },
  one_hot_encode: { bg: 'rgba(236,72,153,0.15)', text: '#f9a8d4' },
}

export default function DataCleaning() {
  const navigate = useNavigate()
  const { dataset, setDataset, addCleaningStep, cleaningSteps } = useAppContext()
  const [recommendations, setRecommendations] = useState([])
  const [detecting, setDetecting] = useState(false)
  const [applying, setApplying] = useState(null)
  const [error, setError] = useState(null)
  const [beforeSnapshot, setBeforeSnapshot] = useState(null)
  const [afterSnapshot, setAfterSnapshot] = useState(null)
  const [currentDataset, setCurrentDataset] = useState(dataset)

  // Auto-detect issues on mount
  useEffect(() => {
    if (!dataset) return
    setDetecting(true)
    setCurrentDataset(dataset)
    const timer = setTimeout(() => {
      const recs = getRecommendations(dataset)
      setRecommendations(recs)
      setDetecting(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [dataset])

  const handleApply = async (rec) => {
    if (!currentDataset) return
    setApplying(rec.operation + (rec.column || ''))
    setError(null)

    const snapshot = {
      rowCount: currentDataset.rowCount,
      qualityScore: currentDataset.qualityScore,
      rows: currentDataset.rows.slice(0, 5),
    }
    setBeforeSnapshot(snapshot)

    await new Promise((r) => setTimeout(r, 1000)) // Min 1s loading

    try {
      const step = {
        id: `${rec.operation}_${rec.column || 'all'}_${Date.now()}`,
        operation: rec.operation,
        column: rec.column,
        appliedAt: Date.now(),
        rowsBefore: currentDataset.rowCount,
        rowsAfter: 0,
      }

      const updated = applyCleaningStep(currentDataset, step)
      step.rowsAfter = updated.rowCount

      setAfterSnapshot({
        rowCount: updated.rowCount,
        qualityScore: updated.qualityScore,
        rows: updated.rows.slice(0, 5),
      })

      setCurrentDataset(updated)
      setDataset(updated)
      addCleaningStep(step, updated)

      // Remove applied recommendation
      setRecommendations((prev) =>
        prev.filter((r) => !(r.operation === rec.operation && r.column === rec.column))
      )
    } catch (err) {
      setError(`Cleaning failed: ${err.message}. Dataset preserved.`)
      setBeforeSnapshot(null)
    } finally {
      setApplying(null)
    }
  }

  if (!dataset) {
    return (
      <div
        className="min-h-screen p-6 md:p-8 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
      >
        <GlassCard className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📂</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Dataset Loaded
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Please upload a dataset before accessing the Data Cleaning module.
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

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Data Cleaning
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Auto-detected issues and recommended cleaning operations for{' '}
            <strong style={{ color: 'var(--color-accent)' }}>{dataset.name}</strong>
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard value={currentDataset?.rowCount || 0} label="Current Rows" color="accent" delay={0.1} />
          <StatCard value={currentDataset?.missingCount || 0} label="Missing Values" color="warning" delay={0.15} />
          <StatCard value={currentDataset?.duplicateCount || 0} label="Duplicates" color="error" delay={0.2} />
          <StatCard
            value={currentDataset?.qualityScore || 0}
            label="Quality Score"
            suffix="/100"
            color={currentDataset?.qualityScore >= 70 ? 'success' : 'warning'}
            delay={0.25}
          />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <GlassCard>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Cleaning Recommendations
            </h3>

            {detecting ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div
                  className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
                />
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Detecting issues...
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Dataset is clean!
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  No issues detected. You can proceed to EDA.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, i) => {
                  const colors = operationColors[rec.operation] || operationColors.normalize
                  const key = rec.operation + (rec.column || '')
                  const isApplying = applying === key
                  return (
                    <motion.div
                      key={key}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              {operationLabels[rec.operation]}
                            </span>
                            {rec.column && (
                              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                → {rec.column}
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {rec.reason}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApply(rec)}
                          disabled={!!applying}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200 flex-shrink-0"
                          style={{
                            background: isApplying
                              ? 'rgba(99,102,241,0.5)'
                              : 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                            opacity: applying && !isApplying ? 0.5 : 1,
                          }}
                        >
                          {isApplying ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlassCard>

          {/* Applied Steps */}
          <GlassCard>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Applied Steps ({cleaningSteps.length})
            </h3>
            {cleaningSteps.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                No cleaning steps applied yet.
              </p>
            ) : (
              <div className="space-y-2">
                {cleaningSteps.map((step, i) => {
                  const colors = operationColors[step.operation] || operationColors.normalize
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <span className="text-emerald-400 text-sm">✓</span>
                      <div className="flex-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {operationLabels[step.operation]}
                        </span>
                        {step.column && (
                          <span className="text-xs ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                            on {step.column}
                          </span>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {step.rowsBefore} → {step.rowsAfter} rows
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Before/After Comparison */}
        <AnimatePresence>
          {beforeSnapshot && afterSnapshot && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Before / After Comparison
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium mb-2" style={{ color: '#ef4444' }}>
                      Before
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {beforeSnapshot.rowCount} rows
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Quality: {beforeSnapshot.qualityScore}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2" style={{ color: '#10b981' }}>
                      After
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {afterSnapshot.rowCount} rows
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Quality: {afterSnapshot.qualityScore}/100
                      {afterSnapshot.qualityScore > beforeSnapshot.qualityScore && (
                        <span className="ml-2 text-emerald-400">
                          +{afterSnapshot.qualityScore - beforeSnapshot.qualityScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Preview */}
        {currentDataset && (
          <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <GlassCard>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Current Data Preview
              </h3>
              <DataPreviewTable rows={currentDataset.rows} columns={currentDataset.columns} maxRows={10} />
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
