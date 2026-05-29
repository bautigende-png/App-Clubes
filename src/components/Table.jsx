export function Table({ headers, children, empty = 'Sin datos' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-900/50">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr>
              <td colSpan={headers.length} className="text-center py-12 text-slate-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick, className = '' }) {
  return (
    <tr
      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-slate-300 ${className}`}>{children}</td>
  )
}
