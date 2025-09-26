import './Table.css'

const Table = ({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  className = '',
  striped = true,
  hoverable = true,
  ...props 
}) => {
  const tableClass = `
    table 
    ${striped ? 'table--striped' : ''}
    ${hoverable ? 'table--hoverable' : ''}
    ${loading ? 'table--loading' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  if (loading) {
    return (
      <div className="table-container">
        <div className="table-loading">
          <div className="table-loading__spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className={tableClass} {...props}>
        <thead className="table__head">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={column.key || index}
                className={`table__header ${column.className || ''}`}
                style={{ 
                  width: column.width,
                  textAlign: column.align || 'left'
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table__body">
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="table__row">
              {columns.map((column, colIndex) => (
                <td 
                  key={`${rowIndex}-${column.key || colIndex}`}
                  className={`table__cell ${column.className || ''}`}
                  style={{ textAlign: column.align || 'left' }}
                >
                  {column.render 
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
