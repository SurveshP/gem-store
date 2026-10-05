import React from 'react'

const FloatingSelect = ({ label, value, onChange, options = [] }) => {
  return (
    <div className="gem-float-group gem-float-select-wrap">
      <select
        value={value || ''}
        onChange={onChange}
        className={`gem-float-select ${value ? 'has-value' : ''}`}
      >
        <option value="" disabled hidden></option>
        {options.map((opt, index) => {
          // Support both string and {value, label} objects
          const val = typeof opt === 'object' ? opt.value : opt
          const lbl = typeof opt === 'object' ? opt.label : opt
          return (
            <option key={index} value={val}>
              {lbl}
            </option>
          )
        })}
      </select>
      <label className="gem-float-label">{label}</label>
    </div>
  )
}

export default FloatingSelect