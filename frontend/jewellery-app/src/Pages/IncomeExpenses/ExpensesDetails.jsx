import React, { useEffect, useState, useCallback } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import ExpensesPopup from './ExpensesPopup'
import { FaTrash, FaEdit } from 'react-icons/fa'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/expenses'

const ExpensesDetails = () => {
  const [formValues, setFormValues] = useState({})
  const [expensesData, setExpensesData] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupTitle, setPopupTitle] = useState('')
  const [editData, setEditData] = useState(null)

  // ================= FETCH DATA =================
  const fetchExpenses = useCallback(async (searchText = '') => {
    setLoading(true)
    try {
      //URL fix
      const url = searchText.trim()
        ? `${API_BASE}/search?search=${encodeURIComponent(searchText.trim())}`
        : API_BASE

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch expenses')
      }

      setExpensesData(data.data || [])
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // ================= HANDLERS =================
  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchExpenses(formValues.search || '')
  }

  const handleClearSearch = () => {
    setFormValues((prev) => ({ ...prev, search: '' }))
    fetchExpenses('')
  }

  const handleAddNew = () => {
    setEditData(null)
    setPopupTitle('Add New Record')
    setIsPopupOpen(true)
  }

  const handleEdit = (row) => {
    setEditData(row)
    setPopupTitle('Edit Record')
    setIsPopupOpen(true)
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Do you want to delete this record?')
    if (!confirmed) return

    const toastId = toast.loading('Deleting record...')
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Delete failed')
      }

      toast.update(toastId, {
        render: 'Record deleted successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      })
      fetchExpenses(formValues.search || '')
    } catch (err) {
      console.error(err)
      toast.update(toastId, {
        render: err.message || 'Delete failed',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const handlePopupClose = (refresh = false) => {
    setIsPopupOpen(false)
    setEditData(null)
    if (refresh === true) {
      fetchExpenses(formValues.search || '')
    }
  }

  // ================= TABLE CONFIG =================
  const fields = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Filter By [Date or Remark]',
      className: 'col-12',
    },
  ]

  const columns = [
    { header: 'SN', render: (_, index) => index + 1 },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Income',
      render: (row) => (
        <span style={{ color: '#22c55e', fontWeight: 600 }}>
          ₹{Number(row.income || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Expense',
      render: (row) => (
        <span style={{ color: '#ef4444', fontWeight: 600 }}>
          ₹{Number(row.expense || 0).toFixed(2)}
        </span>
      ),
    },
    { header: 'Remark', accessor: 'remark' },
    {
      header: 'Action',
      render: (row) => (
        <div className="d-flex justify-content-center gap-3 fs-5">
          <FaEdit
            role="button"
            title="Edit"
            style={{ color: '#facc15', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => handleEdit(row)}
          />
          <FaTrash
            role="button"
            title="Delete"
            style={{ color: '#ef4444', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ]

  // ================= UI =================
  return (
    <>
      <BreadcrumbNav />
      <CardSection />

      <div className="container-fluid px-3 px-sm-4 px-lg-5 py-4">
        {/* PAGE HEADER */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div className="d-flex align-items-center">
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 26,
                background: '#facc15',
                borderRadius: 4,
                marginRight: 12,
              }}
            ></span>
            <div>
              <h2 className="h4 fw-bold mb-0 text-warning">Income / Expenses</h2>
              <p className="small text-secondary mb-0">
                Manage all your income and expenses here
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH PANEL */}
        <div
          className="rounded-3 p-3 p-sm-4 mb-4"
          style={{
            background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
            border: '1px solid rgba(250, 204, 21, 0.15)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-8">
              <DynamicForm
                fields={fields}
                formValues={formValues}
                onChange={onChange}
              />
            </div>

            <div className="col-6 col-md-2">
              <Button text="Search!" className="w-100" onClick={handleSearch} />
            </div>

            <div className="col-6 col-md-2">
              <Button
                text="+ New Record"
                className="w-100"
                onClick={handleAddNew}
              />
            </div>
          </div>

          {formValues.search && (
            <div className="mt-3">
              <span
                role="button"
                onClick={handleClearSearch}
                style={{
                  fontSize: '0.8rem',
                  color: '#facc15',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear search
              </span>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div
          className="rounded-3 overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
            border: '1px solid rgba(250, 204, 21, 0.15)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning mb-2" role="status" />
            </div>
          ) : expensesData.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <div className="text-secondary mt-2">No records found</div>
              <div
                style={{ fontSize: '0.8rem', color: '#71717a' }}
                className="mt-1"
              >
                Click <span className="text-warning">+ New Record</span> to add one
              </div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={expensesData} />
          )}
        </div>

        {/* ============ POPUP ============ */}
        <ExpensesPopup
          isOpen={isPopupOpen}
          onClose={handlePopupClose}
          title={popupTitle}
          initialValues={editData || {}}
        />
      </div>
    </>
  )
}

export default ExpensesDetails