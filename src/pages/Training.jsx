/**
 * Training.jsx
 * Simulated model training with progress bar, epoch logs, and performance dashboard.
 */
import { useState, useRef, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { simulateTraining } from '../utils/mlSimulator.js'
import GlassCard from '../components/GlassCard.jsx'
import ProgressBar from '../components/ProgressBar.jsx'

const Plot = lazy(() => import('react-plotly.js'))

const plotlyLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#94a3b8', size: 11 },
  margin: { t: 30, r: 20, b: 50, l: 50 },
  xaxis: { gridcolor: 'rgba(255,255,255,0.05)', title: 'Epoch' },
  yaxis: { gridcolor: 'rgba(255,255,255,0.05)' },
}

export default function Training() {
  const navigate = useNavigate()
  const { selectedModel, setTrainingResults, trainingResults } = useAppContext()
  const [isTraining, setIsTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [epochLogs, setEpochLogs] = useState([])
  const [results, setResults] = useState(trainingResults)
  const cancelRef = useRef(false)

  if (!selectedModel) {
    return (
      <div
        className="min-h-screen p-6 md:p-8 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
      >
        <GlassCard className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Model Selected
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Please select a model from the Recommendation page first.
          </p>
          <button
            onClick={() => navigate('/recommendation')}
            className="px-6 py-2 rounded-lg font-medium text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}
          >
            Go to Recommendations
          </button>
        </GlassCard>
      </div>
    )
  }

  const handleTrain = async () => {
    if (isTraining) return
    setIsTraining(true)
    setProgress(0)
    setEpochLogs([])
    setResults(null)
    cancelRef.current = false

    const logs = []
    let epochCount = 0

    try {
      const trainingResult = await simulateTraining(selectedModel, (epochLog) => {
        if (cancelRef.current) return
        logs.push(epochLog)
        epochCount++
        setEpochLogs([...logs])
        setProgress((epochCount / 10) * 100)
      })

      if (!cancelRef.current) {
        setResults(trainingResult)
        setTrainingResults(trainingResult)
        setProgress(100)
      }
    } catch (err) {
      console.error('Training error:', err)
    } finally {
      setIsTraining(false)
    }
  }

  const handleCancel = () => {
    cancelRef.current = true
    setIsTraining(false)
    setProgress(0)
    setEpochLogs([])
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
            Model Training
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Training{' '}
            <strong style={{ color: 'var(--color-accent)' }}>{selectedModel.name}</strong>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Training Control */}
          <GlassCard>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Training Control
            </h3>

            {/* Model info */}
            <div
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {selectedModel.name}
              </div>
              <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Expected accuracy: {(selectedModel.accuracy * 100).toFixed(1)}%
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <ProgressBar progress={progress} label="Training Progress" />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleTrain}
                disabled={isTraining}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200"
                style={{
                  background: isTraining
                    ? 'rgba(99,102,241,0.4)'
                    : 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                  cursor: isTraining ? 'not-allowed' : 'pointer',
                }}
              >
                {isTraining ? 'Training...' : results ? 'Retrain Model' : 'Train Model'}
              </button>
              {isTraining && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.3)',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </GlassCard>

          {/* Epoch Logs */}
          <GlassCard>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Training Log
            </h3>
            {epochLogs.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm">Epoch logs will appear here during training.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
                {epochLogs.map((log) => (
                  <motion.div
                    key={log.epoch}
                    className="flex gap-4 p-2 rounded"
                    style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span style={{ color: 'var(--color-accent)' }}>
                      Epoch {String(log.epoch).padStart(2, '0')}/10
                    </span>
                    <span style={{ color: '#ef4444' }}>
                      loss: {log.loss.toFixed(4)}
                    </span>
                    <span style={{ color: '#10b981' }}>
                      acc: {log.accuracy.toFixed(4)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Performance Dashboard */}
        {results && (
          <motion.div
            className="mt-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Performance Dashboard
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Final Accuracy', value: `${(results.finalAccuracy * 100).toFixed(2)}%`, color: '#10b981' },
                { label: 'Val Accuracy', value: `${(results.validationMetrics.accuracy * 100).toFixed(2)}%`, color: '#6366f1' },
                { label: 'Val Loss', value: results.validationMetrics.loss.toFixed(4), color: '#f59e0b' },
                { label: 'Duration', value: `${results.duration.toFixed(1)}s`, color: '#8b5cf6' },
              ].map((item) => (
                <GlassCard key={item.label}>
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.label}
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Summary Card */}
            <GlassCard>
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Training Complete: {results.modelName}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {results.epochs.length} epochs · {results.duration.toFixed(1)}s · Final accuracy: {(results.finalAccuracy * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Loss Curve */}
            <GlassCard>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Training Curves
              </h3>
              <Suspense fallback={<div className="h-64 flex items-center justify-center" style={{ color: 'var(--color-text-secondary)' }}>Loading chart...</div>}>
                <Plot
                  data={[
                    {
                      type: 'scatter',
                      mode: 'lines+markers',
                      x: results.epochs.map((e) => e.epoch),
                      y: results.epochs.map((e) => e.loss),
                      name: 'Loss',
                      line: { color: '#ef4444', width: 2 },
                      marker: { size: 6 },
                    },
                    {
                      type: 'scatter',
                      mode: 'lines+markers',
                      x: results.epochs.map((e) => e.epoch),
                      y: results.epochs.map((e) => e.accuracy),
                      name: 'Accuracy',
                      line: { color: '#10b981', width: 2 },
                      marker: { size: 6 },
                      yaxis: 'y2',
                    },
                  ]}
                  layout={{
                    ...plotlyLayout,
                    yaxis2: {
                      overlaying: 'y',
                      side: 'right',
                      gridcolor: 'rgba(255,255,255,0.05)',
                      title: 'Accuracy',
                    },
                    legend: { font: { color: '#94a3b8' } },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%', height: '300px' }}
                />
              </Suspense>
            </GlassCard>

            {/* Next Steps */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/code')}
                className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}
              >
                Generate Code →
              </button>
              <button
                onClick={() => navigate('/export')}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 glass"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Export Model →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
