import React, { useState, useEffect } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/creditList'

const CreditListZeroBalance = () => {
  const [formValues, setFormValues] = useState({ search: '' })
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // ================= FETCH DATA (Search by Name, Ac No, Mobile) =================
  const fetchData = async (searchQuery = '') => {
    setLoading(true)
    try {
      const url = searchQuery.trim()
        ? `${API_BASE}/zero-balance?search=${encodeURIComponent(searchQuery.trim())}`
        : `${API_BASE}/zero-balance?search=`

      const res = await fetch(url)
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

  // Initial load pe saara zero balance data fetch hoga
  useEffect(() => {
    fetchData()
  }, [])

  // ================= HANDLERS =================
  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchData(formValues.search || '')
  }

  const handleClearSearch = () => {
    setFormValues({ search: '' })
    fetchData('')
  }

  // ================= TABLE CONFIG =================
  const fields = [
    {
      key: 'search',
      label: 'Search (Account No, Name, Mobile)',
      type: 'text',
      placeholder: 'Enter account no, name or mobile...',
      className: 'col-12',
    },
  ]

  const columns = [
    { header: 'Ac No', accessor: 'accountNo' },
    { header: 'Client Name', accessor: 'clientName' },
    { header: 'Referred By', accessor: 'referredBy' },
    { header: 'Mobile', accessor: 'mobile' },
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
        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>
          ₹{Number(row.finalBalance || 0).toFixed(2)}
        </span>
      ),
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
              <h2 className="h4 fw-bold mb-0 text-warning">Credit List (Zero Balance)</h2>
              <p className="small text-secondary mb-0">View cleared credit accounts</p>
            </div>
          </div>
          <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(250, 204, 21, 0.12)', color: '#facc15', fontSize: '0.8rem' }}>
            {data.length} Records
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
              <div className="text-secondary mt-2">No zero balance records found</div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={data} />
          )}
        </div>
      </div>
    </>
  )
}

export default CreditListZeroBalance