/**
 * EDA.jsx
 * Exploratory Data Analysis with Plotly charts and AI insights.
 */
import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { generateInsights } from '../utils/statsUtils.js'
import GlassCard from '../components/GlassCard.jsx'

// Lazy load Plotly to avoid SSR issues
const Plot = lazy(() => import('react-plotly.js'))

const CHART_TYPES = ['Histogram', 'Box Plot', 'Distribution', 'Pie Chart', 'Bar Chart', 'Scatter Plot', 'Heatmap']

const plotlyLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#94a3b8', size: 12 },
  margin: { t: 30, r: 20, b: 50, l: 50 },
  xaxis: { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' },
  yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' },
  colorway: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
}

const plotlyConfig = {
  displayModeBar: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  responsive: true,
}

function ChartLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div
        className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

function ChartWrapper({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), Math.max(300, delay))
    return () => clearTimeout(t)
  }, [delay])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {children}
        </motion.div>
      ) : (
        <ChartLoader />
      )}
    </AnimatePresence>
  )
}

export default function EDA() {
  const navigate = useNavigate()
  const { dataset } = useAppContext()
  const [selectedColumn, setSelectedColumn] = useState('')
  const [activeChart, setActiveChart] = useState('Histogram')
  const [insights, setInsights] = useState([])

  useEffect(() => {
    if (dataset?.columns?.length > 0) {
      const firstNumeric = dataset.columns.find((c) => c.dtype === 'numeric')
      setSelectedColumn(firstNumeric?.name || dataset.columns[0]?.name || '')
      setInsights(generateInsights(dataset))
    }
  }, [dataset])

  useEffect(() => {
    if (!selectedColumn || !dataset) return
    const col = dataset.columns.find((c) => c.name === selectedColumn)
    if (col?.dtype === 'numeric') {
      if (!['Histogram', 'Box Plot', 'Distribution', 'Scatter Plot', 'Heatmap'].includes(activeChart)) {
        setActiveChart('Histogram')
      }
    } else if (col?.dtype === 'categorical') {
      if (!['Pie Chart', 'Bar Chart'].includes(activeChart)) {
        setActiveChart('Pie Chart')
      }
    }
  }, [selectedColumn, dataset])

  if (!dataset) {
    return (
      <div
        className="min-h-screen p-6 md:p-8 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
      >
        <GlassCard className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Dataset Loaded
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Please upload a dataset to access the EDA dashboard.
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

  const col = dataset.columns.find((c) => c.name === selectedColumn)
  const colValues = dataset.rows.map((r) => r[selectedColumn]).filter((v) => v !== null && v !== undefined)
  const isNumeric = col?.dtype === 'numeric'
  const isCategorical = col?.dtype === 'categorical'

  // Compute chart data
  const numericValues = colValues.filter((v) => typeof v === 'number' && !isNaN(v))

  // Category counts
  const categoryCounts = {}
  colValues.forEach((v) => {
    const key = String(v)
    categoryCounts[key] = (categoryCounts[key] || 0) + 1
  })
  const catLabels = Object.keys(categoryCounts)
  const catValues = Object.values(categoryCounts)

  // Correlation heatmap data
  const numericCols = dataset.columns.filter((c) => c.dtype === 'numeric').slice(0, 8)
  const corrMatrix = numericCols.map((c1) => {
    return numericCols.map((c2) => {
      const v1 = dataset.rows.map((r) => r[c1.name]).filter((v) => typeof v === 'number' && !isNaN(v))
      const v2 = dataset.rows.map((r) => r[c2.name]).filter((v) => typeof v === 'number' && !isNaN(v))
      if (c1.name === c2.name) return 1
      const n = Math.min(v1.length, v2.length)
      if (n < 2) return 0
      const m1 = v1.slice(0, n).reduce((s, v) => s + v, 0) / n
      const m2 = v2.slice(0, n).reduce((s, v) => s + v, 0) / n
      const cov = v1.slice(0, n).reduce((s, v, i) => s + (v - m1) * (v2[i] - m2), 0) / (n - 1)
      const s1 = Math.sqrt(v1.slice(0, n).reduce((s, v) => s + Math.pow(v - m1, 2), 0) / (n - 1)) || 1
      const s2 = Math.sqrt(v2.slice(0, n).reduce((s, v) => s + Math.pow(v - m2, 2), 0) / (n - 1)) || 1
      return Math.max(-1, Math.min(1, cov / (s1 * s2)))
    })
  })

  // Scatter: first two numeric columns
  const scatterCols = dataset.columns.filter((c) => c.dtype === 'numeric')
  const scatterX = scatterCols[0] ? dataset.rows.map((r) => r[scatterCols[0].name]) : []
  const scatterY = scatterCols[1] ? dataset.rows.map((r) => r[scatterCols[1].name]) : scatterX

  const visibleCharts = isNumeric
    ? ['Histogram', 'Box Plot', 'Distribution', 'Scatter Plot', 'Heatmap']
    : isCategorical
    ? ['Pie Chart', 'Bar Chart']
    : CHART_TYPES

  const renderChart = () => {
    switch (activeChart) {
      case 'Histogram':
        return (
          <ChartWrapper delay={400}>
            <Suspense fallback={<ChartLoader />}>
              <Plot
                data={[{ type: 'histogram', x: numericValues, marker: { color: '#6366f1', opacity: 0.8 }, nbinsx: 20 }]}
                layout={{ ...plotlyLayout, title: { text: `Distribution of ${selectedColumn}`, font: { color: '#94a3b8' } } }}
                config={plotlyConfig}
                style={{ width: '100%', height: '350px' }}
              />
            </Suspense>
          </ChartWrapper>
        )

      case 'Box Plot':
        return (
          <ChartWrapper delay={400}>
            <Suspense fallback={<ChartLoader />}>
              <Plot
                data={[{ type: 'box', y: numericValues, name: selectedColumn, marker: { color: '#8b5cf6' }, boxpoints: 'outliers' }]}
                layout={{ ...plotlyLayout, title: { text: `Box Plot: ${selectedColumn}`, font: { color: '#94a3b8' } } }}
                config={plotlyConfig}
                style={{ width: '100%', height: '350px' }}
              />
            </Suspense>
          </ChartWrapper>
        )

      case 'Distribution':
        return (
          <ChartWrapper delay={400}>
            <Suspense fallback={<ChartLoader />}>
              <Plot
                data={[
                  { type: 'histogram', x: numericValues, histnorm: 'probability density', marker: { color: '#6366f1', opacity: 0.6 }, name: 'Density' },
                ]}
                layout={{ ...plotlyLayout, title: { text: `Distribution Analysis: ${selectedColumn}`, font: { color: '#94a3b8' } }, bargap: 0.05 }}
                config={plotlyConfig}
                style={{ width: '100%', height: '350px' }}
              />
            </Suspense>
          </ChartWrapper>
        )

      case 'Pie Chart':
        return (
          <ChartWrapper delay={400}>
            <Suspense fallback={<ChartLoader />}>
              <Plot
                data={[{ type: 'pie', labels: catLabels, values: catValues, hole: 0.3, marker: { colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'] } }]}
                layout={{ ...plotlyLayout, title: { text: `Distribution of ${selectedColumn}`, font: { color: '#94a3b8' } }, showlegend: true }}
                config={plotlyConfig}
                style={{ width: '100%', height: '350px' }}
              />
            </Suspense>
          </ChartWrapper>
        )

      case 'Bar Chart':
        return (
          <ChartWrapper delay={400}>
            <Suspense fallback={<ChartLoader />}>
              <Plot
                data={[{ type: 'bar', x: catLabels, y: catValues, marker: { color: '#6366f1', opacity: 0.8 } }]}
                layout={{ ...plotlyLayout, title: { text: `Bar Chart: ${selectedColumn}`, font: { color: '#94a3b8' } } }}
                config={plotlyConfig}
                style={{ width: '100%', height: '350px' }}
              />
            </Suspense>
          </ChartWrapper>
        )

      case 'Scatter Plot':
        return (
          <ChartWrapper delay={400}>
            <Suspense fallback={<ChartLoader />}>
              <Plot
                data={[{
                  type: 'scatter', mode: 'markers',
                  x: scatterX, y: scatterY,
                  marker: { color: '#6366f1', opacity: 0.6, size: 6 },
                  name: `${scatterCols[0]?.name} vs ${scatterCols[1]?.name || scatterCols[0]?.name}`,
                }]}
                layout={{
                  ...plotlyLayout,
                  title: { text: `Scatter: ${scatterCols[0]?.name} vs ${scatterCols[1]?.name || scatterCols[0]?.name}`, font: { color: '#94a3b8' } },
                  xaxis: { ...plotlyLayout.xaxis, title: scatterCols[0]?.name },
                  yaxis: { ...plotlyLayout.yaxis, title: scatterCols[1]?.name || scatterCols[0]?.name },
                }}
                config={plotlyConfig}
                style={{ width: '100%', height: '350px' }}
              />
            </Suspense>
          </ChartWrapper>
        )

      case 'Heatmap':
        return (
          <ChartWrapper delay={600}>
            <Suspense fallback={<ChartLoader />}>
              <Plot
                data={[{
                  type: 'heatmap',
                  z: corrMatrix,
                  x: numericCols.map((c) => c.name),
                  y: numericCols.map((c) => c.name),
                  colorscale: 'RdBu',
                  zmid: 0,
                  text: corrMatrix.map((row) => row.map((v) => v.toFixed(2))),
                  texttemplate: '%{text}',
                  showscale: true,
                }]}
                layout={{ ...plotlyLayout, title: { text: 'Correlation Heatmap', font: { color: '#94a3b8' } } }}
                config={plotlyConfig}
                style={{ width: '100%', height: '400px' }}
              />
            </Suspense>
          </ChartWrapper>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Exploratory Data Analysis
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Interactive visualizations for{' '}
            <strong style={{ color: 'var(--color-accent)' }}>{dataset.name}</strong>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Controls */}
          <div className="xl:col-span-1 space-y-4">
            {/* Column Selector */}
            <GlassCard>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Column
              </h3>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                aria-label="Select column for analysis"
              >
                {dataset.columns.map((c) => (
                  <option key={c.name} value={c.name} style={{ backgroundColor: '#1a1a2e' }}>
                    {c.name} ({c.dtype})
                  </option>
                ))}
              </select>
            </GlassCard>

            {/* Chart Type Selector */}
            <GlassCard>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Chart Type
              </h3>
              <div className="space-y-1">
                {visibleCharts.map((chart) => (
                  <button
                    key={chart}
                    onClick={() => setActiveChart(chart)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200"
                    style={{
                      backgroundColor: activeChart === chart ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color: activeChart === chart ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      fontWeight: activeChart === chart ? '600' : '400',
                    }}
                  >
                    {chart}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* AI Insights */}
            <GlassCard>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                🤖 AI Insights
              </h3>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    className="p-3 rounded-lg text-xs leading-relaxed"
                    style={{
                      backgroundColor: 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      color: 'var(--color-text-secondary)',
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-indigo-400 font-medium">#{i + 1}</span> {insight}
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Chart Area */}
          <div className="xl:col-span-3">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {activeChart}
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: isNumeric ? 'rgba(99,102,241,0.15)' : 'rgba(139,92,246,0.15)',
                    color: isNumeric ? '#a5b4fc' : '#c4b5fd',
                  }}
                >
                  {col?.dtype || 'unknown'}
                </span>
              </div>
              {renderChart()}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
