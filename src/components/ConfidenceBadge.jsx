/**
 * ConfidenceBadge.jsx
 * Pill badge displaying AI confidence percentage with color coding.
 */

export default function ConfidenceBadge({ score = 0 }) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)))

  let bgColor, textColor, label
  if (clampedScore >= 70) {
    bgColor = 'rgba(16, 185, 129, 0.15)'
    textColor = '#10b981'
    label = 'High'
  } else if (clampedScore >= 40) {
    bgColor = 'rgba(245, 158, 11, 0.15)'
    textColor = '#f59e0b'
    label = 'Medium'
  } else {
    bgColor = 'rgba(239, 68, 68, 0.15)'
    textColor = '#ef4444'
    label = 'Low'
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
      title={`Confidence: ${clampedScore}% (${label})`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: textColor }}
      />
      {clampedScore}%
    </span>
  )
}
