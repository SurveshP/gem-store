import React from 'react'

const Button = ({ text, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn fw-semibold px-4 py-3 ${className}`}
      style={{
        background: 'linear-gradient(90deg, #facc15, #f59e0b)',
        color: '#000',
        borderRadius: '0.5rem',
        border: 'none',
        boxShadow: '0 4px 14px rgba(250, 204, 21, 0.25)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(250, 204, 21, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(250, 204, 21, 0.25)'
      }}
    >
      {text}
    </button>
  )
}

export default Button