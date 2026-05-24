/**
 * dataAnalyzer.js
 * Analyzes raw row data to produce a Dataset object with quality metrics.
 */

/**
 * Detect the dtype of a column based on its values.
 * @param {unknown[]} values
 * @returns {'numeric' | 'categorical' | 'datetime' | 'boolean'}
 */
function detectDtype(values) {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '')

  if (nonNull.length === 0) return 'categorical'

  // Check boolean
  const boolSet = new Set(['true', 'false', '0', '1', true, false, 0, 1])
  if (nonNull.every((v) => boolSet.has(typeof v === 'string' ? v.toLowerCase() : v))) {
    const uniqueVals = new Set(nonNull.map((v) => String(v).toLowerCase()))
    if (uniqueVals.size <= 2) return 'boolean'
  }

  // Check numeric
  const numericCount = nonNull.filter((v) => {
    if (typeof v === 'number') return !isNaN(v)
    if (typeof v === 'string') return !isNaN(parseFloat(v)) && isFinite(Number(v))
    return false
  }).length

  if (numericCount / nonNull.length > 0.8) return 'numeric'

  // Check datetime
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,
    /^\d{2}\/\d{2}\/\d{4}/,
    /^\d{2}-\d{2}-\d{4}/,
  ]
  const dateCount = nonNull.filter((v) => {
    if (typeof v !== 'string') return false
    return datePatterns.some((p) => p.test(v)) && !isNaN(Date.parse(v))
  }).length

  if (dateCount / nonNull.length > 0.8) return 'datetime'

  return 'categorical'
}

/**
 * Count missing values in an array.
 */
function countMissing(values) {
  return values.filter((v) => v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))).length
}

/**
 * Compute DataQualityScore.
 * score = 100 - (missingRatio*40) - (duplicateRatio*20) - (lowCardinalityPenalty*10) - (highCardinalityPenalty*10)
 * Clamped to [0, 100].
 */
export function computeQualityScore(dataset) {
  const { rows, columns, rowCount, missingCount, duplicateCount } = dataset

  if (!rows || rowCount === 0) return 0

  const missingRatio = missingCount / (rowCount * columns.length || 1)
  const duplicateRatio = duplicateCount / rowCount

  // Low cardinality penalty: columns with only 1 unique value
  const lowCardCols = columns.filter((c) => c.uniqueCount <= 1).length
  const lowCardinalityPenalty = lowCardCols / (columns.length || 1)

  // High cardinality penalty: categorical columns where uniqueCount === rowCount
  const highCardCols = columns.filter(
    (c) => c.dtype === 'categorical' && c.uniqueCount === rowCount && rowCount > 5
  ).length
  const highCardinalityPenalty = highCardCols / (columns.length || 1)

  const score =
    100 -
    missingRatio * 40 -
    duplicateRatio * 20 -
    lowCardinalityPenalty * 10 -
    highCardinalityPenalty * 10

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Analyze raw rows and return a full Dataset object.
 * @param {Record<string, unknown>[]} rows
 * @param {string} name - dataset name (filename without extension)
 * @returns {Dataset}
 */
export function analyze(rows, name = 'dataset') {
  if (!rows || rows.length === 0) {
    return {
      name,
      rows: [],
      columns: [],
      rowCount: 0,
      colCount: 0,
      missingCount: 0,
      duplicateCount: 0,
      qualityScore: 0,
    }
  }

  const columnNames = Object.keys(rows[0])

  // Count duplicates via JSON.stringify comparison
  const seen = new Set()
  let duplicateCount = 0
  for (const row of rows) {
    const key = JSON.stringify(row)
    if (seen.has(key)) {
      duplicateCount++
    } else {
      seen.add(key)
    }
  }

  // Analyze each column
  const columns = columnNames.map((colName) => {
    const values = rows.map((r) => r[colName])
    const dtype = detectDtype(values)
    const missingCount = countMissing(values)
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '')
    const uniqueCount = new Set(nonNullValues.map((v) => String(v))).size

    return {
      name: colName,
      dtype,
      missingCount,
      uniqueCount,
    }
  })

  const missingCount = columns.reduce((sum, c) => sum + c.missingCount, 0)

  const dataset = {
    name,
    rows,
    columns,
    rowCount: rows.length,
    colCount: columnNames.length,
    missingCount,
    duplicateCount,
    qualityScore: 0,
  }

  dataset.qualityScore = computeQualityScore(dataset)

  return dataset
}

/**
 * Generate cleaning recommendations based on dataset issues.
 * @param {Dataset} dataset
 * @returns {Array<{operation: string, column?: string, reason: string}>}
 */
export function getRecommendations(dataset) {
  const validOps = ['remove_nulls', 'fill_missing', 'standardize', 'normalize', 'label_encode', 'one_hot_encode']
  const recommendations = []

  for (const col of dataset.columns) {
    if (col.missingCount > 0) {
      if (col.dtype === 'numeric') {
        recommendations.push({
          operation: 'fill_missing',
          column: col.name,
          reason: `Column "${col.name}" has ${col.missingCount} missing numeric values. Fill with median.`,
        })
      } else {
        recommendations.push({
          operation: 'remove_nulls',
          column: col.name,
          reason: `Column "${col.name}" has ${col.missingCount} missing values. Remove affected rows.`,
        })
      }
    }

    if (col.dtype === 'numeric') {
      recommendations.push({
        operation: 'normalize',
        column: col.name,
        reason: `Normalize "${col.name}" to [0,1] range for better model performance.`,
      })
    }

    if (col.dtype === 'categorical') {
      if (col.uniqueCount <= 10) {
        recommendations.push({
          operation: 'one_hot_encode',
          column: col.name,
          reason: `One-hot encode "${col.name}" (${col.uniqueCount} categories) for ML compatibility.`,
        })
      } else {
        recommendations.push({
          operation: 'label_encode',
          column: col.name,
          reason: `Label encode "${col.name}" (${col.uniqueCount} unique values) for ML compatibility.`,
        })
      }
    }
  }

  if (dataset.duplicateCount > 0) {
    recommendations.push({
      operation: 'remove_nulls',
      column: undefined,
      reason: `Dataset has ${dataset.duplicateCount} duplicate rows. Consider removing them.`,
    })
  }

  // Ensure all operations are from the valid set
  return recommendations
    .filter((r) => validOps.includes(r.operation))
    .slice(0, 8) // Limit to 8 recommendations
}

export default { analyze, computeQualityScore, getRecommendations }
