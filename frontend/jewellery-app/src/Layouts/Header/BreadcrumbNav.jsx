import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaChevronRight } from 'react-icons/fa'

const BreadcrumbNav = () => {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  const formatLabel = (str) =>
    str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())

  return (
    <div
      className="px-3 px-sm-4 px-lg-5 py-2"
      style={{
        background: 'rgba(24, 24, 27, 0.6)',
        borderBottom: '1px solid rgba(250, 204, 21, 0.1)',
      }}
    >
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0 small">
          <li className="breadcrumb-item">
            <Link
              to="/"
              className="text-decoration-none d-inline-flex align-items-center gap-1"
              style={{ color: '#a1a1aa' }}
            >
              <FaHome size={11} /> Home
            </Link>
          </li>
          {paths.map((p, i) => (
            <li
              key={i}
              className={`breadcrumb-item ${i === paths.length - 1 ? 'active' : ''}`}
              style={{
                color: i === paths.length - 1 ? '#facc15' : '#a1a1aa',
              }}
            >
              {formatLabel(p)}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

export default BreadcrumbNav