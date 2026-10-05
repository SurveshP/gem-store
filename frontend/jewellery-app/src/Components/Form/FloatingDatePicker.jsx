import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const FloatingDatePicker = ({ label, value, onChange }) => {
  return (
    <div className="gem-float-group gem-datepicker-wrap">
      <DatePicker
        selected={value}
        onChange={(date) => onChange(date)}
        dateFormat="dd/MM/yyyy"
        placeholderText=" "
        wrapperClassName="w-100"
        className="gem-float-input"
        popperClassName="gem-datepicker-popper"
        calendarClassName="gem-datepicker-calendar"
        showPopperArrow={false}
      />
      <label className={`gem-float-label ${value ? 'gem-float-label-up' : ''}`}>
        {label}
      </label>
    </div>
  )
}

export default FloatingDatePicker