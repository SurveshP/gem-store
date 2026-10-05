import React from 'react'
import FloatingLabel from './FloatingLabel'
import FloatingDatePicker from './FloatingDatePicker'
import FloatingSelect from './FloatingSelect'

const DynamicForm = ({ fields, formValues, onChange }) => {
  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <FloatingLabel
            label={field.label}
            type={field.type}
            value={formValues[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        )

      case 'date':
        return (
          <FloatingDatePicker
            label={field.label}
            value={formValues[field.key] || null}
            onChange={(date) => onChange(field.key, date)}
          />
        )

      case 'select':
        return (
          <FloatingSelect
            label={field.label}
            value={formValues[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            options={field.options || []}
          />
        )

      case 'file':
        return (
          <div className="d-flex flex-column align-items-center mb-2">
            <label className="gem-file-upload">
              <div className="gem-file-circle">
                {formValues[field.key] ? (
                  <img
                    src={URL.createObjectURL(formValues[field.key])}
                    alt="Upload preview"
                    className="gem-file-preview"
                  />
                ) : (
                  <span className="gem-file-text">Upload</span>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => onChange(field.key, e.target.files[0])}
                hidden
              />
            </label>

            <p className="gem-file-label">{field.label}</p>
          </div>
        )

      case 'textarea':
        return (
          <div className="gem-float-group">
            <textarea
              value={formValues[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder=" "
              rows={field.rows || 3}
              className="gem-float-input"
              style={{ resize: 'vertical', minHeight: 90 }}
            />
            <label className="gem-float-label">{field.label}</label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="row g-3">
      {fields?.map((field, index) => (
        <div key={field.key || index} className={field.className || 'col-12'}>
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}

export default DynamicForm