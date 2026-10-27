import React, { useEffect, useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/expenses'

const ExpensesPopup = ({
  isOpen,
  onClose,
  title,
  initialValues = {},
}) => {
  const [formValues, setFormValues] = useState({
    date: '',
    type: 'Income',
    amount: '',
    remark: '',
  })

  // =========================
  // SET INITIAL VALUES (Edit Mode Fix)
  // =========================
  useEffect(() => {
    if (isOpen) {
      let formattedDate = initialValues.date || ''
      
      // ✅ SAFE DATE PARSER: Convert DD-MM-YYYY to YYYY-MM-DD
      if (formattedDate && typeof formattedDate === 'string') {
        if (formattedDate.includes('-')) {
          const parts = formattedDate.split('-')
          if (parts[0].length !== 4 && parts[2]?.length === 4) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
          }
        }
      }

      // Determine Income or Expense for Edit Mode
      let type = 'Income'
      let amount = ''

      if (initialValues.id) {
        if (Number(initialValues.expense) > 0) {
          type = 'Expense'
          amount = initialValues.expense
        } else {
          type = 'Income'
          amount = initialValues.income
        }
      }

      setFormValues({
        date: formattedDate,
        type: type,
        amount: amount,
        remark: initialValues.remark || '',
      })
    }
  }, [isOpen, initialValues])

  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  // =========================
  // FORM FIELDS
  // =========================
  const fields = [
    {
      key: 'date',
      label: 'Date *',
      type: 'date',
      className: 'col-12 col-md-4',
    },
    {
      key: 'type',
      label: 'Income/Expense *',
      type: 'select',
      options: ['Income', 'Expense'],
      className: 'col-12 col-md-4',
    },
    {
      key: 'amount',
      label: 'Amount *',
      type: 'text',
      className: 'col-12 col-md-4',
    },
    {
      key: 'remark',
      label: 'Remarks',
      type: 'text',
      className: 'col-12',
    },
  ]

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = () => {
    if (!formValues.date) {
      toast.error('Date is required')
      return
    }

    if (!formValues.amount || Number(formValues.amount) <= 0) {
      toast.error('Valid Amount is required')
      return
    }

    const isEdit = !!initialValues?.id

    // Format Date back to DD-MM-YYYY for Backend
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      
      return `${day}-${month}-${year}`
    }

    // Smart Logic for Income/Expense
    const payload = {
      date: formatDate(formValues.date),
      income: formValues.type === 'Income' ? formValues.amount : 0,
      expense: formValues.type === 'Expense' ? formValues.amount : 0,
      remark: formValues.remark,
    }

    console.log('📤 Expense Payload:', payload)

    const toastId = toast.loading(isEdit ? 'Updating...' : 'Saving...')

    const url = isEdit
      ? `${API_BASE}/${initialValues.id}`
      : `${API_BASE}/create`

    const method = isEdit ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.update(toastId, {
            render: isEdit ? 'Record updated successfully' : 'Record saved successfully',
            type: 'success',
            isLoading: false,
            autoClose: 2500,
          })
          onClose?.(true)
        } else {
          toast.update(toastId, {
            render: data.message || 'Save failed',
            type: 'error',
            isLoading: false,
            autoClose: 3000,
          })
        }
      })
      .catch((err) => {
        console.error(err)
        toast.update(toastId, {
          render: 'Save Failed: ' + err.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      })
  }

  // =========================
  // UI
  // =========================
  return (
    <DynamicPopup
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Income / Expense Record'}
      onSave={handleSubmit}
      saveText={initialValues?.id ? 'Update' : 'Submit'}
      size="md"
    >
      <div
        className="rounded-3 p-3 p-sm-4 mb-4"
        style={{
          background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
          border: '1px solid rgba(250, 204, 21, 0.15)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <h6 className="fw-bold mb-1 text-warning">Income / Expenses</h6>
        <p className="small text-secondary mb-4">
          Note: * - Indicates a required fields
        </p>

        <DynamicForm
          fields={fields}
          formValues={formValues}
          onChange={onChange}
        />
      </div>
    </DynamicPopup>
  )
}

export default ExpensesPopup