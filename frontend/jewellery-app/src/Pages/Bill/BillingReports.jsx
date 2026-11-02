import React, { useState, useEffect } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/billing'

const BillingReports = () => {
  const [formValues, setFormValues] = useState({ 
    billType: '', 
    dateFrom: '', 
    dateTo: '' 
  })
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (formValues.billType) {
        params.append('billType', formValues.billType)
      }
      
      // ✅ Date Format Convert (YYYY-MM-DD to DD-MM-YYYY)
      if (formValues.dateFrom) {
        const [y, m, d] = formValues.dateFrom.split('-')
        params.append('dateFrom', `${d}-${m}-${y}`)
      }
      if (formValues.dateTo) {
        const [y, m, d] = formValues.dateTo.split('-')
        params.append('dateTo', `${d}-${m}-${y}`)
      }

      const res = await fetch(`${API_BASE}/report?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch data')
      }

      setData(json.data || [])
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // =========================
  // HANDLERS
  // =========================
  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchData()
  }

  const handleClearSearch = () => {
    setFormValues({ billType: '', dateFrom: '', dateTo: '' })
    setTimeout(() => {
      fetchData()
    }, 100)
  }

  const handlePrint = () => {
    toast.success('Opening print window...')
  }

  // =========================
  // FORM FIELDS
  // =========================
  const fields = [
    {
      key: 'billType',
      label: 'Bill Type',
      type: 'select',
      options: ['', 'Bill', 'Bill WG', 'Estimate'],
      className: 'col-12 col-md-4',
    },
    {
      key: 'dateFrom',
      label: 'Date From',
      type: 'date',
      className: 'col-12 col-md-4',
    },
    {
      key: 'dateTo',
      label: 'Date To',
      type: 'date',
      className: 'col-12 col-md-4',
    },
  ]

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    { header: 'Type', accessor: 'billType' },
    { header: 'Bill No', accessor: 'billNo' },
    { header: 'Ac No', accessor: 'accountNo' },
    { header: 'Date', accessor: 'billDate' },
    { header: 'Client Name', accessor: 'customerName' },
    {
      header: 'Amount',
      render: (row) => `₹${Number(row.finalAmount || 0).toFixed(2)}`,
    },
    {
      header: 'CGST',
      render: (row) => `₹${Number(row.cgst || 0).toFixed(2)}`,
    },
    {
      header: 'SGST',
      render: (row) => `₹${Number(row.sgst || 0).toFixed(2)}`,
    },
    {
      header: 'Round',
      render: (row) => `₹${Number(row.roundAmount || 0).toFixed(2)}`,
    },
    {
      header: 'Total',
      render: (row) => <span className="text-warning fw-bold">₹{Number(row.finalTotal || 0).toFixed(2)}</span>,
    },
    {
      header: 'Paid',
      render: (row) => <span className="text-success fw-bold">₹{Number(row.paid || 0).toFixed(2)}</span>,
    },
    {
      header: 'Bal',
      render: (row) => <span className="text-danger fw-bold">₹{Number(row.balance || 0).toFixed(2)}</span>,
    },
  ]

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
              <h2 className="h4 fw-bold mb-0 text-warning">Billing Reports</h2>
              <p className="small text-secondary mb-0">Filter bills by Type and Date Range</p>
            </div>
          </div>
          <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(250, 204, 21, 0.12)', color: '#facc15', fontSize: '0.8rem' }}>
            {data.length} Records
          </span>
        </div>

        {/* FILTER SECTION */}
        <div className="rounded-3 p-3 p-sm-4 mb-4" style={{ background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)', border: '1px solid rgba(250, 204, 21, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' }}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-8">
              <DynamicForm fields={fields} formValues={formValues} onChange={onChange} />
            </div>
            <div className="col-6 col-md-2">
              <Button text="Search!" className="w-100" onClick={handleSearch} />
            </div>
            <div className="col-6 col-md-2">
              <Button text="Print" className="w-100" onClick={handlePrint} />
            </div>
          </div>
          {(formValues.dateFrom || formValues.dateTo || formValues.billType) && (
            <div className="mt-3 text-end">
              <span role="button" onClick={handleClearSearch} style={{ fontSize: '0.8rem', color: '#facc15', cursor: 'pointer', textDecoration: 'underline' }}>
                Clear Filter
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
          ) : data.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <div className="text-secondary mt-2">No records found for the selected filter</div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={data} />
          )}
        </div>
      </div>
    </>
  )
}

export default BillingReports