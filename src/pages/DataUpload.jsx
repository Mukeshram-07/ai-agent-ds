/**
 * DataUpload.jsx
 * Drag-and-drop file upload with CSV/Excel parsing and dataset preview.
 */
import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext.jsx'
import { parse } from '../utils/fileParser.js'
import { analyze } from '../utils/dataAnalyzer.js'
import GlassCard from '../components/GlassCard.jsx'
import StatCard from '../components/StatCard.jsx'
import DataPreviewTable from '../components/DataPreviewTable.jsx'

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const dtypeColors = {
  numeric: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc' },
  categorical: { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd' },
  datetime: { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7' },
  boolean: { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d' },
}

export default function DataUpload() {
  const { setDataset, dataset } = useAppContext()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [localDataset, setLocalDataset] = useState(dataset)
  const fileInputRef = useRef(null)

  const processFile = useCallback(async (file) => {
    setError(null)
    setIsLoading(true)

    // Minimum 1.5s loading animation
    const minLoadingTime = new Promise((r) => setTimeout(r, 1500))

    try {
      const [rows] = await Promise.all([parse(file), minLoadingTime])
      const name = file.name.replace(/\.[^/.]+$/, '')
      const analyzed = analyze(rows, name)
      setLocalDataset(analyzed)
      setDataset(analyzed)
    } catch (err) {
      setError(err.message || 'Failed to process file.')
    } finally {
      setIsLoading(false)
    }
  }, [setDataset])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) processFile(file)
    e.target.value = '' // Reset input
  }

  const displayDataset = localDataset || dataset

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Dataset Upload
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Upload a CSV or Excel file to begin your data science workflow.
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                isDragging ? 'scale-[1.02]' : ''
              }`}
              style={{
                borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: isDragging ? 'rgba(99,102,241,0.1)' : 'transparent',
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload dataset file"
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="File input"
              />

              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
                  />
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Analyzing your dataset...
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Detecting column types, missing values, and quality metrics
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="p-4 rounded-full"
                    style={{
                      backgroundColor: isDragging ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    <UploadIcon />
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {isDragging ? 'Drop your file here' : 'Drag & drop your dataset'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      or click to browse — supports .csv and .xlsx files
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {['CSV', 'XLSX'].map((fmt) => (
                      <span
                        key={fmt}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'rgba(99,102,241,0.15)',
                          color: 'var(--color-accent)',
                        }}
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                className="mt-4 p-3 rounded-lg flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>

        {/* Dataset Analysis Results */}
        {displayDataset && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Success banner */}
            <div
              className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981',
              }}
            >
              <CheckIcon />
              <span className="font-medium">
                Successfully loaded: <strong>{displayDataset.name}</strong>
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <StatCard value={displayDataset.rowCount} label="Total Rows" color="accent" delay={0.1} />
              <StatCard value={displayDataset.colCount} label="Columns" color="purple" delay={0.15} />
              <StatCard value={displayDataset.missingCount} label="Missing Values" color="warning" delay={0.2} />
              <StatCard value={displayDataset.duplicateCount} label="Duplicate Rows" color="error" delay={0.25} />
              <StatCard
                value={displayDataset.qualityScore}
                label="Quality Score"
                suffix="/100"
                color={displayDataset.qualityScore >= 70 ? 'success' : 'warning'}
                delay={0.3}
              />
              <StatCard
                value={displayDataset.columns.filter((c) => c.dtype === 'numeric').length}
                label="Numeric Cols"
                color="blue"
                delay={0.35}
              />
            </div>

            {/* Column Types */}
            <GlassCard className="mb-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Column Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayDataset.columns.map((col) => {
                  const colors = dtypeColors[col.dtype] || dtypeColors.categorical
                  return (
                    <div
                      key={col.name}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}
                    >
                      <div>
                        <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {col.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {col.uniqueCount} unique · {col.missingCount} missing
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {col.dtype}
                      </span>
                    </div>
                  )
                })}
              </div>
            </GlassCard>

            {/* Data Preview */}
            <GlassCard>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Data Preview (first 10 rows)
              </h3>
              <DataPreviewTable
                rows={displayDataset.rows}
                columns={displayDataset.columns}
                maxRows={10}
              />
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
