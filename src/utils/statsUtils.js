/**
 * statsUtils.js
 * Statistical utility functions for EDA and AI insights.
 */

/**
 * Compute the mean of a numeric array.
 */
export function mean(arr) {
  if (!arr || arr.length === 0) return 0
  const nums = arr.filter((v) => typeof v === 'number' && !isNaN(v))
  if (nums.length === 0) return 0
  return nums.reduce((sum, v) => sum + v, 0) / nums.length
}

/**
 * Compute the median of a numeric array.
 */
export function median(arr) {
  if (!arr || arr.length === 0) return 0
  const nums = arr.filter((v) => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b)
  if (nums.length === 0) return 0
  const mid = Math.floor(nums.length / 2)
  return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid]
}

/**
 * Compute the standard deviation of a numeric array.
 */
export function stdDev(arr) {
  if (!arr || arr.length < 2) return 0
  const nums = arr.filter((v) => typeof v === 'number' && !isNaN(v))
  if (nums.length < 2) return 0
  const m = mean(nums)
  const variance = nums.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (nums.length - 1)
  return Math.sqrt(variance)
}

/**
 * Compute skewness of a numeric array (Pearson's moment coefficient).
 */
export function skewness(arr) {
  if (!arr || arr.length < 3) return 0
  const nums = arr.filter((v) => typeof v === 'number' && !isNaN(v))
  if (nums.length < 3) return 0
  const m = mean(nums)
  const s = stdDev(nums)
  if (s === 0) return 0
  const n = nums.length
  const cubedDiffs = nums.reduce((sum, v) => sum + Math.pow((v - m) / s, 3), 0)
  return (n / ((n - 1) * (n - 2))) * cubedDiffs
}

/**
 * Compute Pearson correlation coefficient between two arrays.
 */
export function correlation(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length || arr1.length < 2) return 0
  const n = arr1.length
  const m1 = mean(arr1)
  const m2 = mean(arr2)
  const s1 = stdDev(arr1)
  const s2 = stdDev(arr2)
  if (s1 === 0 || s2 === 0) return 0
  const cov = arr1.reduce((sum, v, i) => sum + (v - m1) * (arr2[i] - m2), 0) / (n - 1)
  return cov / (s1 * s2)
}

/**
 * Count outliers using the IQR method.
 */
export function countOutliers(arr) {
  if (!arr || arr.length < 4) return 0
  const nums = arr.filter((v) => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b)
  if (nums.length < 4) return 0
  const q1 = nums[Math.floor(nums.length * 0.25)]
  const q3 = nums[Math.floor(nums.length * 0.75)]
  const iqr = q3 - q1
  const lower = q1 - 1.5 * iqr
  const upper = q3 + 1.5 * iqr
  return nums.filter((v) => v < lower || v > upper).length
}

/**
 * Generate 3–5 insight strings from a dataset.
 * Each insight references at least one of: mean, median, skewness, correlation, outlier count.
 * @param {Dataset} dataset
 * @returns {string[]}
 */
export function generateInsights(dataset) {
  if (!dataset || !dataset.rows || dataset.rows.length === 0) {
    return [
      'No data available for analysis.',
      'Upload a dataset to see insights.',
      'Insights will appear here after data upload.',
    ]
  }

  const insights = []
  const numericCols = dataset.columns.filter((c) => c.dtype === 'numeric')
  const categoricalCols = dataset.columns.filter((c) => c.dtype === 'categorical')

  // Insight 1: Mean and median of first numeric column
  if (numericCols.length > 0) {
    const col = numericCols[0]
    const values = dataset.rows.map((r) => r[col.name]).filter((v) => typeof v === 'number' && !isNaN(v))
    if (values.length > 0) {
      const m = mean(values)
      const med = median(values)
      insights.push(
        `The column "${col.name}" has a mean of ${m.toFixed(2)} and a median of ${med.toFixed(2)}.`
      )
    }
  }

  // Insight 2: Skewness
  if (numericCols.length > 0) {
    const col = numericCols[0]
    const values = dataset.rows.map((r) => r[col.name]).filter((v) => typeof v === 'number' && !isNaN(v))
    if (values.length >= 3) {
      const skew = skewness(values)
      const direction = skew > 0.5 ? 'positively skewed' : skew < -0.5 ? 'negatively skewed' : 'approximately symmetric'
      insights.push(
        `"${col.name}" is ${direction} with a skewness of ${skew.toFixed(3)}.`
      )
    }
  }

  // Insight 3: Outliers
  if (numericCols.length > 0) {
    const col = numericCols[numericCols.length > 1 ? 1 : 0]
    const values = dataset.rows.map((r) => r[col.name]).filter((v) => typeof v === 'number' && !isNaN(v))
    if (values.length >= 4) {
      const outlierCount = countOutliers(values)
      insights.push(
        `Column "${col.name}" contains ${outlierCount} outlier${outlierCount !== 1 ? 's' : ''} based on the IQR method.`
      )
    }
  }

  // Insight 4: Correlation between first two numeric columns
  if (numericCols.length >= 2) {
    const col1 = numericCols[0]
    const col2 = numericCols[1]
    const vals1 = dataset.rows.map((r) => r[col1.name]).filter((v) => typeof v === 'number' && !isNaN(v))
    const vals2 = dataset.rows.map((r) => r[col2.name]).filter((v) => typeof v === 'number' && !isNaN(v))
    const minLen = Math.min(vals1.length, vals2.length)
    if (minLen >= 2) {
      const corr = correlation(vals1.slice(0, minLen), vals2.slice(0, minLen))
      const strength = Math.abs(corr) > 0.7 ? 'strong' : Math.abs(corr) > 0.4 ? 'moderate' : 'weak'
      const direction = corr >= 0 ? 'positive' : 'negative'
      insights.push(
        `There is a ${strength} ${direction} correlation (${corr.toFixed(3)}) between "${col1.name}" and "${col2.name}".`
      )
    }
  }

  // Insight 5: Categorical distribution
  if (categoricalCols.length > 0) {
    const col = categoricalCols[0]
    insights.push(
      `The categorical column "${col.name}" has ${col.uniqueCount} unique values across ${dataset.rowCount} rows.`
    )
  } else if (insights.length < 3) {
    insights.push(
      `Dataset has ${dataset.rowCount} rows and ${dataset.colCount} columns with a quality score of ${dataset.qualityScore}/100.`
    )
  }

  // Ensure we return between 3 and 5 insights
  const result = insights.slice(0, 5)
  while (result.length < 3) {
    result.push(`Dataset contains ${dataset.rowCount} rows and ${dataset.colCount} columns.`)
  }

  return result
}

export default { mean, median, stdDev, skewness, correlation, countOutliers, generateInsights }
