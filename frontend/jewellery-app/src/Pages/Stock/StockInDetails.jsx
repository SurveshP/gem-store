// ===============================
// StockInDetails.jsx
// ===============================

import React, { useEffect, useState, useCallback } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { FaEdit, FaTrash } from 'react-icons/fa'
import StockInDetailsPopup from './StockInDetailsPopup'
import StockInDetailsGroupPopup from './StockInDetailsGroupPopup'   // 👈 NAYA
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/stock'

const StockInDetails = () => {
  const [formValues, setFormValues] = useState({})
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(false)

  // Popup states
  const [isPopupOpen, setIsPopupOpen] = useState(false)              // Individual / Add
  const [isGroupPopupOpen, setIsGroupPopupOpen] = useState(false)    // 👈 Group edit
  const [popupTitle, setPopupTitle] = useState('')
  const [editData, setEditData] = useState(null)

  // =========================
  // FETCH STOCK
  // =========================
  const fetchStock = useCallback(async (searchText = '') => {
    setLoading(true)

    try {
      const url = searchText.trim()
        ? `${API_BASE}/search/data?search=${encodeURIComponent(searchText.trim())}`
        : `${API_BASE}/active/all`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch stocks')
      }

      setStockData(data.data || [])
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Failed to fetch stocks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  // =========================
  // EDIT STOCK — type ke hisaab se popup choose karo
  // =========================
  const handleEdit = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        const record = data.data
        setEditData(record)

        // ✅ Type ke hisaab se popup decide karo
        if (record?.types === 'Group') {
          setPopupTitle('Edit Group Stock')
          setIsGroupPopupOpen(true)
          setIsPopupOpen(false)
        } else {
          setPopupTitle('Edit Stock')
          setIsPopupOpen(true)
          setIsGroupPopupOpen(false)
        }
      } else {
        toast.error(data.message || 'Failed to fetch stock')
      }
    } catch (error) {
      console.log(error)
      toast.error('Error fetching stock')
    }
  }

  // =========================
  // DELETE STOCK (STATUS UPDATE)
  // =========================
  const handleDeleteStock = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to deactivate this stock?'
    )

    if (!confirmDelete) return

    const toastId = toast.loading('Deactivating stock...')

    try {
      const response = await fetch(`${API_BASE}/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activeStatus: 0 }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to deactivate')
      }

      toast.update(toastId, {
        render: data.message || 'Stock deactivated successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      })

      fetchStock(formValues.search || '')
    } catch (error) {
      console.log(error)
      toast.update(toastId, {
        render: error.message || 'Server Error',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  // =========================
  // HANDLERS
  // =========================
  const onChange = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSearch = () => {
    fetchStock(formValues.search || '')
  }

  const handleClearSearch = () => {
    setFormValues((prev) => ({ ...prev, search: '', soldStatus: '' }))
    fetchStock('')
  }

  // ✅ Add New — hamesha normal popup (dono type ke liye same)
  const handleAddNew = () => {
    setEditData(null)
    setPopupTitle('Add New Stock')
    setIsPopupOpen(true)
    setIsGroupPopupOpen(false)
  }

  // =========================
  // POPUP CLOSE HANDLERS
  // =========================
  const handlePopupClose = (refresh = false) => {
    setIsPopupOpen(false)
    setEditData(null)

    if (refresh) {
      fetchStock(formValues.search || '')
    }
  }

  const handleGroupPopupClose = (refresh = false) => {
    setIsGroupPopupOpen(false)
    setEditData(null)

    if (refresh) {
      fetchStock(formValues.search || '')
    }
  }

  // =========================
  // SEARCH FORM
  // =========================
  const fields = [
    {
      key: 'soldStatus',
      label: 'Sold Status',
      type: 'text',
      className: 'col-12 col-md-6',
    },
    {
      key: 'search',
      label: 'Search by Item / Tag',
      type: 'text',
      className: 'col-12 col-md-6',
    },
  ]

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    { header: 'SN', accessor: 'id' },
    { header: 'Bill No', accessor: 'billNo' },
    {
      header: 'Stock Date',
      render: (row) =>
        new Date(row.stockBillDate).toLocaleDateString(),
    },
    { header: 'Vendor Name', accessor: 'venderName' },
    { header: 'Description', accessor: 'item' },
    { header: 'Types', accessor: 'types' },
    { header: 'Tag No.', accessor: 'tagNo' },
    { header: 'Carat', accessor: 'carat' },
    { header: 'Weight', accessor: 'weight' },
    { header: 'Rate', accessor: 'rate' },
    { header: 'Metal Type', accessor: 'metalType' },
    {
      header: 'Status',
      render: (row) => (
        <span
          className="badge rounded-pill px-2 py-1"
          style={{
            background:
              row.activeStatus === 1
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            color: row.activeStatus === 1 ? '#22c55e' : '#ef4444',
            fontSize: '0.75rem',
          }}
        >
          {row.activeStatus === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <div className="d-flex justify-content-center gap-3 fs-5">
          <FaEdit
            role="button"
            title="Edit Stock"
            style={{ color: '#facc15', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => handleEdit(row.id)}
          />

          <FaTrash
            role="button"
            title="Delete Stock"
            style={{ color: '#ef4444', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => handleDeleteStock(row.id)}
          />
        </div>
      ),
    },
  ]

  // =========================
  // UI
  // =========================
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
              <h2 className="h4 fw-bold mb-0 text-warning">Stocks</h2>
              <p className="small text-secondary mb-0">
                Manage all your jewellery stocks here
              </p>
            </div>
          </div>

          <span
            className="badge rounded-pill px-3 py-2"
            style={{
              background: 'rgba(250, 204, 21, 0.12)',
              color: '#facc15',
              fontSize: '0.8rem',
            }}
          >
            {stockData.length} Records
          </span>
        </div>

        {/* SEARCH SECTION */}
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
              <Button text="Search" className="w-100" onClick={handleSearch} />
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
          ) : stockData.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <div className="text-secondary mt-2">No stocks found</div>
              <div
                style={{ fontSize: '0.8rem', color: '#71717a' }}
                className="mt-1"
              >
                Click <span className="text-warning">+ New Record</span> to add one
              </div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={stockData} />
          )}
        </div>

        {/* ============ POPUPS ============ */}

        {/* Individual / Add */}
        <StockInDetailsPopup
          key={editData?.id || 'new'}
          isOpen={isPopupOpen}
          onClose={handlePopupClose}
          title={popupTitle}
          editData={editData}
          fetchStock={fetchStock}
        />

        {/* Group Edit — sirf Group type ke liye */}
        <StockInDetailsGroupPopup
          key={editData?.id || 'group-new'}
          isOpen={isGroupPopupOpen}
          onClose={handleGroupPopupClose}
          title={popupTitle}
          editData={editData}
          fetchStock={fetchStock}
        />
      </div>
    </>
  )
}

export default StockInDetails