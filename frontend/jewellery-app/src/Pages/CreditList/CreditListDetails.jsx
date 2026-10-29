import React, { useEffect, useState, useCallback } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import CreditPaymentPopup from './CreditPaymentPopup'
import { FaTrash, FaMoneyCheckAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'

//Naya API route (alag controller)
const API_BASE = 'http://localhost:5000/api/creditList'

const CreditListDetails = () => {
  const [formValues, setFormValues] = useState({})
  const [creditList, setCreditList] = useState([])
  const [loading, setLoading] = useState(false)

  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [popupTitle, setPopupTitle] = useState('')

  // ================= FETCH CREDIT LIST =================
  const fetchCreditList = useCallback(async (searchText = '') => {
    setLoading(true)
    try {
      //URL update kiya gaya hai 'search' parameter bhejne ke liye
      const url = searchText.trim()
        ? `${API_BASE}/customer?search=${encodeURIComponent(searchText.trim())}`
        : `${API_BASE}/all`

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch credit list')
      }

      setCreditList(data.data || [])
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to fetch credit list')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCreditList()
  }, [fetchCreditList])

  // ================= HANDLERS =================
  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchCreditList(formValues.search || '')
  }

  const handleClearSearch = () => {
    setFormValues((prev) => ({ ...prev, search: '' }))
    fetchCreditList('')
  }

  const handleCreditPayment = (row) => {
    setSelectedRow(row)
    setPopupTitle(`Credit Payment — ${row.clientName}`)
    setIsPaymentPopupOpen(true)
  }

  const handlePaymentPopupClose = (refresh = false) => {
    setIsPaymentPopupOpen(false)
    setSelectedRow(null)
    if (refresh === true) {
      fetchCreditList(formValues.search || '')
    }
  }

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Delete credit entry for ${row.clientName}?`)
    if (!confirmed) return

    if (!row.billingId) {
      toast.warning('Cannot delete — no billing linked')
      return
    }

    const toastId = toast.loading('Deleting credit entry...')

    try {
      // Note: Ye purana endpoint use kar raha hai kyunki billing delete karna hai
      const res = await fetch(`http://localhost:5000/api/billing/${row.billingId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Delete failed')
      }

      toast.update(toastId, {
        render: 'Credit entry deleted successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      })

      fetchCreditList(formValues.search || '')
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

  // ================= TABLE CONFIG =================
  const fields = [
    {
      key: 'search',
      label: 'Search by Account No., Customer Name, Mobile No.',
      type: 'text',
      placeholder: 'Enter name, mobile, account no...',
      className: 'col-12',
    },
  ]

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Bill No', accessor: 'billNo' },
    { header: 'Client Name', accessor: 'clientName' },
    { header: 'Account No', accessor: 'accountNo' },
    { header: 'Date', accessor: 'billDate' },
    { header: 'Mobile', accessor: 'mobile' },
    { header: 'Referred By', accessor: 'referredBy' },
    {
      header: 'Amount',
      render: (row) => `₹${Number(row.finalAmount || 0).toFixed(2)}`,
    },
    {
      header: 'Cash',
      render: (row) => `₹${Number(row.cash || 0).toFixed(2)}`,
    },
    {
      header: 'Old Gold',
      render: (row) => `₹${Number(row.oldGold || 0).toFixed(2)}`,
    },
    {
      header: 'Balance',
      render: (row) => (
        <span
          style={{
            color: Number(row.finalBalance || 0) > 0 ? '#ef4444' : '#22c55e',
            fontWeight: 600,
          }}
        >
          ₹{Number(row.finalBalance || 0).toFixed(2)}
        </span>
      ),
    },
    { header: 'Next Date', accessor: 'nextDate' },
    {
      header: 'Status',
      render: (row) =>
        Number(row.finalBalance || 0) > 0 ? (
          <span className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.75rem' }}>
            Pending
          </span>
        ) : (
          <span className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontSize: '0.75rem' }}>
            Cleared
          </span>
        ),
    },
    {
      header: 'Action',
      render: (row) => (
        <div className="d-flex justify-content-center gap-3 fs-5">
          <FaMoneyCheckAlt
            role="button"
            title="Credit Payment"
            style={{ color: '#fb923c', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => handleCreditPayment(row)}
          />
          <FaTrash
            role="button"
            title="Delete"
            style={{ color: '#ef4444', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => handleDelete(row)}
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
            <span style={{ display: 'inline-block', width: 4, height: 26, background: '#facc15', borderRadius: 4, marginRight: 12 }}></span>
            <div>
              <h2 className="h4 fw-bold mb-0 text-warning">Credit List</h2>
              <p className="small text-secondary mb-0">Track pending payments and credit sales</p>
            </div>
          </div>
          <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(250, 204, 21, 0.12)', color: '#facc15', fontSize: '0.8rem' }}>
            {creditList.length} Records
          </span>
        </div>

        {/* SEARCH PANEL */}
        <div className="rounded-3 p-3 p-sm-4 mb-4" style={{ background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)', border: '1px solid rgba(250, 204, 21, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' }}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-8">
              <DynamicForm fields={fields} formValues={formValues} onChange={onChange} />
            </div>
            <div className="col-6 col-md-2">
              <Button text="Search" className="w-100" onClick={handleSearch} />
            </div>
            <div className="col-6 col-md-2">
              <Button text="Show All" className="w-100" onClick={handleClearSearch} />
            </div>
          </div>
          {formValues.search && (
            <div className="mt-3">
              <span role="button" onClick={handleClearSearch} style={{ fontSize: '0.8rem', color: '#facc15', cursor: 'pointer', textDecoration: 'underline' }}>
                Clear search
              </span>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="rounded-3 overflow-hidden" style={{ background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)', border: '1px solid rgba(250, 204, 21, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' }}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning mb-2" role="status" />
            </div>
          ) : creditList.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <div className="text-secondary mt-2">No credit records found</div>
              <div style={{ fontSize: '0.8rem', color: '#71717a' }} className="mt-1">
                Credit entries will appear here after saving a bill with balance
              </div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={creditList} />
          )}
        </div>

        {/* ============ CREDIT PAYMENT POPUP ============ */}
        <CreditPaymentPopup
          isOpen={isPaymentPopupOpen}
          onClose={handlePaymentPopupClose}
          title={popupTitle}
          clientName={selectedRow?.clientName || ''}
          accountNo={selectedRow?.accountNo || ''}
          mobile={selectedRow?.mobile || ''}
          finalAmount={selectedRow?.finalAmount || 0}
          finalBalance={selectedRow?.finalBalance || 0}
          billingId={selectedRow?.billingId || null}
          billNo={selectedRow?.billNo || ''}
        />
      </div>
    </>
  )
}

export default CreditListDetails