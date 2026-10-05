import React from 'react'

const FloatingLabel = ({ label, value, onChange, type = 'text' }) => {
  return (
    <div className="gem-float-group">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="gem-float-input"
      />
      <label className="gem-float-label">{label}</label>
    </div>
  )
}

export default FloatingLabel