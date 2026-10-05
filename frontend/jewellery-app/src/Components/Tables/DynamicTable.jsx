import React from 'react'

const DynamicTable = ({ columns, data }) => {
  return (
    <>
      <style>{`
        .gem-table thead th {
          background: linear-gradient(90deg, rgba(250, 204, 21, 0.15), rgba(250, 204, 21, 0.06));
          color: #facc15;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          padding: 1rem;
          border-bottom: 1px solid rgba(250, 204, 21, 0.25);
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .gem-table tbody td {
          color: #000;
          font-size: 0.9rem;
          padding: 0.9rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          vertical-align: middle;
        }
        .gem-table tbody tr {
          transition: background 0.15s ease;
        }
        .gem-table tbody tr:hover {
          background: rgba(250, 204, 21, 0.05);
        }
        .gem-table tbody tr:last-child td {
          border-bottom: none;
        }
        .gem-table-empty {
          color: #71717a;
          text-align: center;
          padding: 2.5rem 1rem !important;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="table-responsive">
        <table className="table gem-table mb-0 align-middle">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="text-center">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="gem-table-empty">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="text-center">
                      {column.render
                        ? column.render(row)
                        : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default DynamicTable