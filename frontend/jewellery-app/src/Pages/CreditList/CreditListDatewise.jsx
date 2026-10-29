import React, { useEffect, useState, useCallback } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/creditList'

const CreditListDatewise = () => {
  const [formValues, setFormValues] = useState({ dateFrom: '', dateTo: '' })
  const [creditList, setCreditList] = useState([])
  const [loading, setLoading] = useState(false)

  // ================= FETCH DATA =================
  const fetchData = async () => {
    if (!formValues.dateFrom || !formValues.dateTo) {
      toast.warning('Please select both Date From and Date To')
      return
    }

    setLoading(true)
    try {
      // Backend ko query params mein date bhejenge
      const url = `${API_BASE}/datewise?dateFrom=${formValues.dateFrom}&dateTo=${formValues.dateTo}`
      
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
  }

  // Initial load pe data mat fetch karo, user pehle date select kare
  // useEffect(() => { fetchData() }, [])

  // ================= HANDLERS =================
  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchData()
  }

  const handleClearSearch = () => {
    setFormValues({ dateFrom: '', dateTo: '' })
    setCreditList([])
  }

  // ================= TABLE CONFIG =================
  const fields = [
    {
      key: 'dateFrom',
      label: 'Date From *',
      type: 'date',
      className: 'col-12 col-md-6',
    },
    {
      key: 'dateTo',
      label: 'Date To *',
      type: 'date',
      className: 'col-12 col-md-6',
    },
  ]

  // Same columns jo CreditListDetails mein hain
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
              <h2 className="h4 fw-bold mb-0 text-warning">Credit List Datewise</h2>
              <p className="small text-secondary mb-0">Filter credit list by specific date range</p>
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
              <Button text="Clear" className="w-100" onClick={handleClearSearch} />
            </div>
          </div>
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
              <div className="text-secondary mt-2">No credit records found for this date range</div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={creditList} />
          )}
        </div>
      </div>
    </>
  )
}

export default CreditListDatewise