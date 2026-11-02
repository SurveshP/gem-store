import React from 'react'

const DynamicTable = ({ columns, data, showSno = true }) => {
  // Sno. Column add karne ka logic
  const displayColumns = showSno 
    ? [
        { 
          header: 'Sno.', 
          render: (_, index) => <span className="fw-bold text-secondary">{index + 1}</span>,
          width: '60px'
        }, 
        ...columns
      ]
    : columns;

  return (
    <>
      <style>{`
        .gem-table-wrapper {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(250, 204, 21, 0.2);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .gem-table {
          margin-bottom: 0;
          border-collapse: separate;
          border-spacing: 0;
        }
        .gem-table thead th {
          background: linear-gradient(180deg, rgba(250, 204, 21, 0.12), rgba(250, 204, 21, 0.04));
          color: #facc15;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 1rem;
          border-bottom: 2px solid rgba(250, 204, 21, 0.3);
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .gem-table tbody td {
          color: #000000; /* Light text color for dark theme */
          font-size: 0.85rem;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
          transition: all 0.2s ease;
        }
        .gem-table tbody tr {
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .gem-table tbody tr:hover {
          background: rgba(250, 204, 21, 0.08);
          transform: scale(1.002);
        }
        .gem-table tbody tr:last-child td {
          border-bottom: none;
        }
        /* Scrollbar styling */
        .gem-table-wrapper::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .gem-table-wrapper::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .gem-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(250, 204, 21, 0.3);
          border-radius: 4px;
        }
        .gem-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(250, 204, 21, 0.5);
        }
        .gem-table-empty {
          color: #71717a;
          text-align: center;
          padding: 3rem 1rem !important;
          font-size: 0.95rem;
          font-weight: 500;
        }
      `}</style>

      <div className="table-responsive gem-table-wrapper">
        <table className="table gem-table align-middle">
          <thead>
            <tr>
              {displayColumns.map((column, index) => (
                <th 
                  key={index} 
                  className={column.header === 'Sno.' ? 'text-center' : 'text-center'}
                  style={{ width: column.width || 'auto' }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length} className="gem-table-empty">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {displayColumns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={column.header === 'Sno.' ? 'text-center' : 'text-center'}
                    >
                      {column.render
                        ? column.render(row, rowIndex) // rowIndex pass kiya taaki logic kaam kare
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