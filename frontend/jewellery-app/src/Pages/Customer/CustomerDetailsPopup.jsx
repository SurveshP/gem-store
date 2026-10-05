import React, { useEffect, useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'

const CustomerDetailsPopup = ({ isOpen, onClose, title, initialValues = {} }) => {
  const [formValues, setFormValues] = useState({})

  useEffect(() => {
    if (isOpen) {
      setFormValues(initialValues || {})
    }
  }, [isOpen, initialValues])

  const fields = [
    { key: 'photo',        label: 'Customer Photo',  type: 'file', className: 'col-12' },
    { key: 'customerName', label: 'Customer Name *', type: 'text', className: 'col-12 col-md-6' },
    { key: 'accountNo',    label: 'Account No. *',   type: 'text', className: 'col-12 col-md-6' },
    { key: 'address',      label: 'Address *',       type: 'text', className: 'col-12' },
    { key: 'mobileNo',     label: 'Mobile Number *', type: 'text', className: 'col-12 col-md-6' },
    { key: 'pan',          label: 'PAN *',           type: 'text', className: 'col-12 col-md-6' },
    { key: 'aadharNo',     label: 'Aadhar No *',     type: 'text', className: 'col-12 col-md-6' },
    { key: 'referredBy',   label: 'Referred By *',   type: 'text', className: 'col-12 col-md-6' },
  ]

  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      const formData = new FormData()

      // Sirf wahi fields daalo jo backend chahta hai
      const textFields = [
        'customerName', 'accountNo', 'address',
        'mobileNo', 'pan', 'aadharNo', 'referredBy',
      ]
      textFields.forEach((key) => {
        formData.append(key, formValues[key] ?? '')
      })

      // File attach karo
      if (formValues.photo instanceof File) {
        formData.append('photo', formValues.photo)
      }

      // Agar update hai (id hai), to update route
      const isUpdate = !!initialValues?.id
      const url = isUpdate
        ? `http://localhost:5000/api/customers/update/${initialValues.id}`
        : `http://localhost:5000/api/customers`

      const res = await fetch(url, {
        method: 'POST',
        body: formData,   // ⚠️ Content-Type manually set mat karo
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Save failed:', data)
        alert(data.message || 'Save failed')
        return
      }

      console.log('Saved:', data)
      onClose?.()
    } catch (err) {
      console.error('Error:', err)
      alert('Something went wrong')
    }
  }

  return (
    <DynamicPopup isOpen={isOpen} onClose={onClose} title={title}>
      <style>{`
        .gem-popup-form .form-label {
          color: #d4d4d8;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.35rem;
        }
        .gem-popup-form .form-control,
        .gem-popup-form .form-select {
          background-color: #0a0a0b;
          border: 1px solid rgba(250, 204, 21, 0.2);
          color: #f4f4f5;
          border-radius: 0.5rem;
          padding: 0.55rem 0.85rem;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .gem-popup-form .form-control:focus,
        .gem-popup-form .form-select:focus {
          background-color: #0a0a0b;
          color: #f4f4f5;
          border-color: #facc15;
          box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.18);
        }
        .gem-popup-form input[type="file"]::file-selector-button {
          background: rgba(250, 204, 21, 0.15);
          color: #facc15;
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 0.35rem;
          margin-right: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .gem-popup-form input[type="file"]::file-selector-button:hover {
          background: rgba(250, 204, 21, 0.25);
        }
      `}</style>

      <div className="gem-popup-form">
        <DynamicForm
          fields={fields}
          formValues={formValues}
          onChange={onChange}
        />

        <div
          className="my-4"
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(250,204,21,0.35), transparent)',
          }}
        ></div>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Button text="Save Customer" onClick={handleSave} />
        </div>
      </div>
    </DynamicPopup>
  )
}

export default CustomerDetailsPopup