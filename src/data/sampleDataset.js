/**
 * sampleDataset.js
 * Pre-built sample dataset for demo mode.
 * 25 rows, 6 columns (mix of numeric and categorical).
 */

const sampleRows = [
  { age: 28, income: 52000, education: 'Bachelor', experience: 3, score: 72.5, label: 'Medium' },
  { age: 35, income: 78000, education: 'Master', experience: 8, score: 88.2, label: 'High' },
  { age: 42, income: 95000, education: 'PhD', experience: 15, score: 91.7, label: 'High' },
  { age: 24, income: 38000, education: 'Bachelor', experience: 1, score: 61.3, label: 'Low' },
  { age: 31, income: 65000, education: 'Master', experience: 6, score: 79.8, label: 'Medium' },
  { age: 29, income: 48000, education: 'Bachelor', experience: 4, score: 68.4, label: 'Medium' },
  { age: 38, income: 82000, education: 'Master', experience: 12, score: 85.6, label: 'High' },
  { age: 26, income: 42000, education: 'Bachelor', experience: 2, score: 64.1, label: 'Low' },
  { age: 45, income: 110000, education: 'PhD', experience: 18, score: 94.3, label: 'High' },
  { age: 33, income: 71000, education: 'Master', experience: 7, score: 82.9, label: 'High' },
  { age: 27, income: 45000, education: 'Bachelor', experience: 2, score: 66.7, label: 'Medium' },
  { age: 40, income: 88000, education: 'PhD', experience: 14, score: 89.1, label: 'High' },
  { age: 22, income: 32000, education: 'Bachelor', experience: 0, score: 55.8, label: 'Low' },
  { age: 36, income: 76000, education: 'Master', experience: 10, score: 84.2, label: 'High' },
  { age: 30, income: 58000, education: 'Bachelor', experience: 5, score: 74.6, label: 'Medium' },
  { age: 48, income: 125000, education: 'PhD', experience: 22, score: 96.8, label: 'High' },
  { age: 25, income: 40000, education: 'Bachelor', experience: 1, score: 59.4, label: 'Low' },
  { age: 37, income: 80000, education: 'Master', experience: 11, score: 86.3, label: 'High' },
  { age: 32, income: 68000, education: 'Master', experience: 6, score: 78.5, label: 'Medium' },
  { age: 43, income: 98000, education: 'PhD', experience: 16, score: 92.4, label: 'High' },
  { age: 23, income: 35000, education: 'Bachelor', experience: 0, score: 57.2, label: 'Low' },
  { age: 39, income: 85000, education: 'Master', experience: 13, score: 87.9, label: 'High' },
  { age: 34, income: 73000, education: 'Master', experience: 8, score: 81.6, label: 'High' },
  { age: 46, income: 115000, education: 'PhD', experience: 20, score: 95.1, label: 'High' },
  { age: 28, income: 50000, education: 'Bachelor', experience: 3, score: 70.3, label: 'Medium' },
]

export const sampleDataset = {
  name: 'sample_employee_data',
  rows: sampleRows,
  columns: [
    { name: 'age', dtype: 'numeric', missingCount: 0, uniqueCount: 24 },
    { name: 'income', dtype: 'numeric', missingCount: 0, uniqueCount: 25 },
    { name: 'education', dtype: 'categorical', missingCount: 0, uniqueCount: 3 },
    { name: 'experience', dtype: 'numeric', missingCount: 0, uniqueCount: 18 },
    { name: 'score', dtype: 'numeric', missingCount: 0, uniqueCount: 25 },
    { name: 'label', dtype: 'categorical', missingCount: 0, uniqueCount: 3 },
  ],
  rowCount: 25,
  colCount: 6,
  missingCount: 0,
  duplicateCount: 0,
  qualityScore: 92,
}

export default sampleDataset
