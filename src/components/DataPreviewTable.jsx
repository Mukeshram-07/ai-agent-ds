/**
 * DataPreviewTable.jsx
 * Horizontally scrollable table for dataset preview.
 */

export default function DataPreviewTable({ rows = [], columns = [], maxRows = 10 }) {
  const displayRows = rows.slice(0, maxRows)
  const colNames = columns.length > 0 ? columns.map((c) => c.name) : Object.keys(rows[0] || {})

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
        No data to preview.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              #
            </th>
            {colNames.map((col) => (
              <th
                key={col}
                className="text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {rowIdx + 1}
              </td>
              {colNames.map((col) => {
                const val = row[col]
                const isNull = val === null || val === undefined || val === ''
                return (
                  <td
                    key={col}
                    className={isNull ? 'italic text-xs' : 'text-sm'}
                    style={{
                      color: isNull ? 'var(--color-error)' : 'var(--color-text-primary)',
                    }}
                  >
                    {isNull ? 'null' : String(val)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div
          className="text-center py-2 text-xs border-t"
          style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
        >
          Showing {maxRows} of {rows.length} rows
        </div>
      )}
    </div>
  )
}
