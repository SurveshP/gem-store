import React, { useState } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/billing'

const TagwiseReport = () => {
  const [formValues, setFormValues] = useState({ dateFrom: '', dateTo: '' })
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({ totalRecord: 0, totalAmount: 0 })
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!formValues.dateFrom || !formValues.dateTo) {
      toast.warning("Please select both Date From and Date To")
      return
    }

    setLoading(true)
    try {
      const [y1, m1, d1] = formValues.dateFrom.split('-')
      const [y2, m2, d2] = formValues.dateTo.split('-')
      
      const from = `${d1}-${m1}-${y1}`
      const to = `${d2}-${m2}-${y2}`

      const res = await fetch(`${API_BASE}/tagwise-report?dateFrom=${from}&dateTo=${to}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch data')
      }

      setData(json.data || [])
      setSummary(json.summary || { totalRecord: 0, totalAmount: 0 })
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchData()
  }

  const handleClearSearch = () => {
    setFormValues({ dateFrom: '', dateTo: '' })
    setData([])
    setSummary({ totalRecord: 0, totalAmount: 0 })
  }

  const handlePrint = () => {
    toast.success('Opening print window...')
  }

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

  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Client Name', accessor: 'clientName' },
    { header: 'Mobile', accessor: 'mobile' },
    {
      header: 'Amount',
      render: (row) => `₹${Number(row.amount || 0).toFixed(2)}`,
    },
    { header: 'Tag No', accessor: 'tagNo' },
    {
      header: 'Weight',
      render: (row) => <span className="fw-bold">{Number(row.weight || 0).toFixed(3)}</span>,
    },
    {
      header: 'Rate',
      render: (row) => `₹${Number(row.rate || 0).toFixed(2)}`,
    },
    {
      header: 'Making',
      render: (row) => `₹${Number(row.making || 0).toFixed(2)}`,
    },
    {
      header: 'Total',
      render: (row) => <span className="text-warning fw-bold">₹{Number(row.total || 0).toFixed(2)}</span>,
    },
  ]

  return (
    <>
      <BreadcrumbNav />
      <CardSection />

      <div className="container-fluid px-3 px-sm-4 px-lg-5 py-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div className="d-flex align-items-center">
            <span style={{ display: 'inline-block', width: 4, height: 26, background: '#facc15', borderRadius: 4, marginRight: 12 }}></span>
            <div>
              <h2 className="h4 fw-bold mb-0 text-warning">Tagwise Report</h2>
              <p className="small text-secondary mb-0">View all item transactions by date range</p>
            </div>
          </div>
          <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(250, 204, 21, 0.12)', color: '#facc15', fontSize: '0.8rem' }}>
            {data.length} Records
          </span>
        </div>

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
          {(formValues.dateFrom || formValues.dateTo) && (
            <div className="mt-3 text-end">
              <span role="button" onClick={handleClearSearch} style={{ fontSize: '0.8rem', color: '#facc15', cursor: 'pointer', textDecoration: 'underline' }}>
                Clear Filter
              </span>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 px-2">
          <div className="text-light">
            <span className="fw-bold text-warning">Total Record:</span> {summary.totalRecord}
          </div>
          <div className="text-light">
            <span className="fw-bold text-warning">Total Amount:</span> ₹{Number(summary.totalAmount).toFixed(2)} &nbsp;|&nbsp;
            <span className="fw-bold text-warning">Date:</span> {formValues.dateFrom || '-'} to {formValues.dateTo || '-'}
          </div>
        </div>

        <div className="rounded-3 overflow-hidden" style={{ background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)', border: '1px solid rgba(250, 204, 21, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' }}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning mb-2" role="status" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <div className="text-secondary mt-2">No records found for this date range</div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={data} />
          )}
        </div>
      </div>
    </>
  )
}

export default TagwiseReport