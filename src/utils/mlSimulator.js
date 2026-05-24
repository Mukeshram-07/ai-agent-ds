/**
 * mlSimulator.js
 * Simulates ML operations: problem type detection, model recommendation,
 * data cleaning, and training simulation.
 */
import { computeQualityScore } from './dataAnalyzer.js'

// ─── Seeded Random ───────────────────────────────────────────────────────────

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function lerp(min, max, t) {
  return min + (max - min) * t
}

// ─── Problem Type Detection ──────────────────────────────────────────────────

/**
 * Detect the ML problem type based on the last column's dtype.
 * @param {Dataset} dataset
 * @returns {'regression' | 'classification' | 'clustering'}
 */
export function detectProblemType(dataset) {
  if (!dataset || !dataset.columns || dataset.columns.length === 0) {
    return 'clustering'
  }

  const lastCol = dataset.columns[dataset.columns.length - 1]

  if (lastCol.dtype === 'numeric') return 'regression'
  if (lastCol.dtype === 'categorical') return 'classification'
  return 'clustering'
}

// ─── Model Recommendation ────────────────────────────────────────────────────

const MODEL_DEFINITIONS = {
  regression: [
    {
      id: 'linear_regression',
      name: 'Linear Regression',
      justificationTemplate: (d) =>
        `Linear Regression is well-suited for "${d.name}" with ${d.colCount} features. It provides interpretable coefficients and works well when relationships are approximately linear.`,
    },
    {
      id: 'random_forest_reg',
      name: 'Random Forest Regressor',
      justificationTemplate: (d) =>
        `Random Forest handles the mix of feature types in "${d.name}" effectively. With ${d.rowCount} rows, it can capture non-linear patterns without overfitting.`,
    },
    {
      id: 'xgboost_reg',
      name: 'XGBoost Regressor',
      justificationTemplate: (d) =>
        `XGBoost excels with tabular data like "${d.name}". Its gradient boosting approach handles missing values and feature interactions in your ${d.colCount}-column dataset.`,
    },
  ],
  classification: [
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      justificationTemplate: (d) =>
        `Logistic Regression provides a strong baseline for "${d.name}" classification. It's interpretable and efficient for datasets with ${d.rowCount} samples.`,
    },
    {
      id: 'random_forest_clf',
      name: 'Random Forest Classifier',
      justificationTemplate: (d) =>
        `Random Forest handles the categorical and numeric mix in "${d.name}" well. It's robust to outliers and provides feature importance rankings.`,
    },
    {
      id: 'decision_tree',
      name: 'Decision Tree',
      justificationTemplate: (d) =>
        `Decision Tree offers full interpretability for "${d.name}". With ${d.colCount} features, it creates human-readable decision rules.`,
    },
    {
      id: 'svm',
      name: 'Support Vector Machine',
      justificationTemplate: (d) =>
        `SVM works well for "${d.name}" with clear class boundaries. It's effective in high-dimensional spaces with ${d.colCount} features.`,
    },
  ],
  clustering: [
    {
      id: 'kmeans',
      name: 'K-Means Clustering',
      justificationTemplate: (d) =>
        `K-Means is ideal for discovering natural groupings in "${d.name}". With ${d.rowCount} samples and ${d.colCount} features, it can identify meaningful clusters.`,
    },
    {
      id: 'dbscan',
      name: 'DBSCAN',
      justificationTemplate: (d) =>
        `DBSCAN can find arbitrarily shaped clusters in "${d.name}" and automatically identifies noise points in your ${d.rowCount}-row dataset.`,
    },
    {
      id: 'hierarchical',
      name: 'Hierarchical Clustering',
      justificationTemplate: (d) =>
        `Hierarchical Clustering provides a dendrogram view of "${d.name}" structure, useful for understanding data hierarchy across ${d.colCount} dimensions.`,
    },
  ],
}

/**
 * Generate a simulated confusion matrix seeded from model index.
 */
function generateConfusionMatrix(seed) {
  const tp = Math.floor(lerp(40, 90, seededRandom(seed)))
  const tn = Math.floor(lerp(35, 85, seededRandom(seed + 1)))
  const fp = Math.floor(lerp(5, 20, seededRandom(seed + 2)))
  const fn = Math.floor(lerp(5, 20, seededRandom(seed + 3)))
  return [
    [tp, fp],
    [fn, tn],
  ]
}

/**
 * Recommend ML models for a dataset.
 * @param {Dataset} dataset
 * @returns {ModelCard[]}
 */
export function recommendModels(dataset) {
  const problemType = detectProblemType(dataset)
  const defs = MODEL_DEFINITIONS[problemType]
  const seed = hashCode(dataset?.name || 'default')

  return defs.map((def, i) => {
    const accuracy = lerp(0.72, 0.97, seededRandom(seed + i * 3))
    const precision = lerp(0.70, 0.96, seededRandom(seed + i * 3 + 1))
    const recall = lerp(0.68, 0.95, seededRandom(seed + i * 3 + 2))
    const f1 = (2 * precision * recall) / (precision + recall)

    const card = {
      id: def.id,
      name: def.name,
      type: problemType,
      accuracy: Math.min(1, accuracy),
      precision: Math.min(1, precision),
      recall: Math.min(1, recall),
      f1: Math.min(1, f1),
      justification: def.justificationTemplate(dataset || { name: 'dataset', colCount: 5, rowCount: 100 }),
    }

    if (problemType === 'classification') {
      card.confusionMatrix = generateConfusionMatrix(seed + i * 10)
    }

    return card
  })
}

// ─── Cleaning Operations ─────────────────────────────────────────────────────

/**
 * Apply a cleaning step to a dataset and return the updated dataset.
 * @param {Dataset} dataset
 * @param {CleaningStep} step
 * @returns {Dataset}
 */
export function applyCleaningStep(dataset, step) {
  const { operation, column } = step
  let rows = [...dataset.rows]

  switch (operation) {
    case 'remove_nulls': {
      if (column) {
        rows = rows.filter((r) => r[column] !== null && r[column] !== undefined && r[column] !== '')
      } else {
        rows = rows.filter((r) =>
          Object.values(r).every((v) => v !== null && v !== undefined && v !== '')
        )
      }
      break
    }

    case 'fill_missing': {
      if (column) {
        const numericValues = rows
          .map((r) => r[column])
          .filter((v) => typeof v === 'number' && !isNaN(v))
          .sort((a, b) => a - b)

        let fillValue = 0
        if (numericValues.length > 0) {
          const mid = Math.floor(numericValues.length / 2)
          fillValue =
            numericValues.length % 2 === 0
              ? (numericValues[mid - 1] + numericValues[mid]) / 2
              : numericValues[mid]
        }

        rows = rows.map((r) => {
          if (r[column] === null || r[column] === undefined || r[column] === '') {
            return { ...r, [column]: fillValue }
          }
          return r
        })
      }
      break
    }

    case 'normalize': {
      if (column) {
        const values = rows.map((r) => r[column]).filter((v) => typeof v === 'number' && !isNaN(v))
        const minVal = Math.min(...values)
        const maxVal = Math.max(...values)
        const range = maxVal - minVal

        rows = rows.map((r) => {
          const v = r[column]
          if (typeof v === 'number' && !isNaN(v)) {
            const normalized = range === 0 ? 0 : (v - minVal) / range
            return { ...r, [column]: Math.max(0, Math.min(1, normalized)) }
          }
          return r
        })
      }
      break
    }

    case 'standardize': {
      if (column) {
        const values = rows.map((r) => r[column]).filter((v) => typeof v === 'number' && !isNaN(v))
        const m = values.reduce((s, v) => s + v, 0) / (values.length || 1)
        const variance = values.reduce((s, v) => s + Math.pow(v - m, 2), 0) / (values.length - 1 || 1)
        const std = Math.sqrt(variance) || 1

        rows = rows.map((r) => {
          const v = r[column]
          if (typeof v === 'number' && !isNaN(v)) {
            return { ...r, [column]: (v - m) / std }
          }
          return r
        })
      }
      break
    }

    case 'label_encode': {
      if (column) {
        const uniqueVals = [...new Set(rows.map((r) => String(r[column])))]
        const mapping = Object.fromEntries(uniqueVals.map((v, i) => [v, i]))
        rows = rows.map((r) => ({ ...r, [column]: mapping[String(r[column])] ?? 0 }))
      }
      break
    }

    case 'one_hot_encode': {
      if (column) {
        const uniqueVals = [...new Set(rows.map((r) => String(r[column])))]
        rows = rows.map((r) => {
          const newRow = { ...r }
          delete newRow[column]
          uniqueVals.forEach((val) => {
            newRow[`${column}_${val}`] = r[column] === val || String(r[column]) === val ? 1 : 0
          })
          return newRow
        })
      }
      break
    }

    default:
      break
  }

  // Rebuild dataset with updated rows
  const columnNames = rows.length > 0 ? Object.keys(rows[0]) : dataset.columns.map((c) => c.name)

  // Count duplicates
  const seen = new Set()
  let duplicateCount = 0
  for (const row of rows) {
    const key = JSON.stringify(row)
    if (seen.has(key)) duplicateCount++
    else seen.add(key)
  }

  // Rebuild columns
  const columns = columnNames.map((colName) => {
    const values = rows.map((r) => r[colName])
    const missingCount = values.filter(
      (v) => v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))
    ).length
    const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '')
    const uniqueCount = new Set(nonNull.map((v) => String(v))).size

    // Detect dtype
    const numericCount = nonNull.filter((v) => typeof v === 'number' && !isNaN(v)).length
    const dtype = numericCount / (nonNull.length || 1) > 0.8 ? 'numeric' : 'categorical'

    return { name: colName, dtype, missingCount, uniqueCount }
  })

  const missingCount = columns.reduce((s, c) => s + c.missingCount, 0)

  const newDataset = {
    ...dataset,
    rows,
    columns,
    rowCount: rows.length,
    colCount: columnNames.length,
    missingCount,
    duplicateCount,
  }

  newDataset.qualityScore = computeQualityScore(newDataset)

  return newDataset
}

// ─── Training Simulation ─────────────────────────────────────────────────────

/**
 * Simulate model training with 10 epochs.
 * @param {ModelCard} model
 * @param {(epochLog: EpochLog) => void} onEpoch - callback per epoch
 * @returns {Promise<TrainingResults>}
 */
export function simulateTraining(model, onEpoch) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const finalAccuracy = model?.accuracy || 0.85
    const initialLoss = 2.5
    const epochs = []
    let currentEpoch = 0
    const totalEpochs = 10
    const epochDuration = 1000 // 1 second per epoch = 10 seconds total

    const runEpoch = () => {
      if (currentEpoch >= totalEpochs) {
        const duration = (Date.now() - startTime) / 1000
        resolve({
          modelName: model?.name || 'Unknown Model',
          epochs,
          finalAccuracy,
          duration,
          validationMetrics: {
            accuracy: finalAccuracy * 0.97,
            loss: epochs[epochs.length - 1]?.loss || 0.1,
          },
        })
        return
      }

      const i = currentEpoch
      const noise = (Math.random() - 0.5) * 0.005
      const lossNoise = (Math.random() - 0.5) * 0.008

      const loss = Math.max(0.001, initialLoss * Math.exp(-0.3 * i) + lossNoise)
      const accuracy = Math.min(1, finalAccuracy * (1 - Math.exp(-0.4 * (i + 1))) + noise)

      const epochLog = {
        epoch: i + 1,
        loss: Math.max(0.001, loss),
        accuracy: Math.max(0, Math.min(1, accuracy)),
      }

      epochs.push(epochLog)
      if (onEpoch) onEpoch(epochLog)

      currentEpoch++
      setTimeout(runEpoch, epochDuration)
    }

    runEpoch()
  })
}

export default { detectProblemType, recommendModels, applyCleaningStep, simulateTraining, computeQualityScore }
