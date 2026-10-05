import React, { useEffect, useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import { toast } from 'react-toastify'

const ItemsPopup = ({ isOpen, onClose, title, initialValues = {} }) => {
  const [formValues, setFormValues] = useState({})

  useEffect(() => {
    if (isOpen) {
      setFormValues(initialValues || {})
    }
  }, [isOpen, initialValues])

  const fields = [
    { key: 'itemName', label: 'Item Name *', type: 'text', className: 'col-12' },
    { key: 'itemType', label: 'Item Type *', type: 'select', options: ['Individual', 'Group'], className: 'col-12 col-md-4' },
    { key: 'shortName', label: 'Short Name *', type: 'text', className: 'col-12 col-md-4' },
    { key: 'tagNo', label: 'Tag No *', type: 'text', className: 'col-12 col-md-4' },
  ]

  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    // 🔒 Basic validation
    if (!formValues.itemName?.trim()) {
      toast.error('Item Name is required')
      return
    }

    const isEdit = !!initialValues?.id

    // JSON payload (no file)
    const payload = {
      itemName: formValues.itemName,
      itemType: formValues.itemType,
      shortName: formValues.shortName,
      tagNo: formValues.tagNo,
    }

    const toastId = toast.loading(isEdit ? 'Updating item...' : 'Saving item...')

    try {
      const url = isEdit
        ? `http://localhost:5000/api/items/update/${initialValues.id}`
        : 'http://localhost:5000/api/items'

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },   // 👈 JSON
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.update(toastId, {
          render: data.message || 'Operation failed',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return
      }

      toast.update(toastId, {
        render: isEdit ? 'Item updated successfully' : 'Item created successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      })

      onClose?.(true)
    } catch (err) {
      console.error(err)
      toast.update(toastId, {
        render: 'Network error. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
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
          <Button text="Save Item" onClick={handleSave} />
        </div>
      </div>
    </DynamicPopup>
  )
}

export default ItemsPopup