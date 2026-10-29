import React, { useState, useEffect } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

//Naya Backend Endpoint for Gold (Range Query)
const API_BASE = 'http://localhost:5000/api/stockRegister/metal'

const StockOutRegisterGold = () => {
  const [formValues, setFormValues] = useState({ search: '', dateFrom: '', dateTo: '' })
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (formValues.search) params.append('search', formValues.search)
      
      if (formValues.dateFrom) {
        const [y, m, d] = formValues.dateFrom.split('-')
        params.append('dateFrom', `${d}/${m}/${y}`)
      }
      if (formValues.dateTo) {
        const [y, m, d] = formValues.dateTo.split('-')
        params.append('dateTo', `${d}/${m}/${y}`)
      }

      const res = await fetch(`${API_BASE}?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch data')
      setData(json.data || [])
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const onChange = (key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))
  const handleSearch = () => fetchData()
  const handleClearSearch = () => {
    setFormValues({ search: '', dateFrom: '', dateTo: '' })
    setTimeout(fetchData, 100)
  }

  const columns = [
    { header: 'Item', accessor: 'item', render: (row) => <span className="fw-bold text-warning">{row.item}</span> },
    { header: 'Tag No', accessor: 'tagNo' },
    { header: 'Type', accessor: 'type' },
    { header: 'Weight (g)', render: (row) => <span className="fw-bold">{Number(row.weight || 0).toFixed(3)}</span> },
    
    { header: 'IN Date', render: (row) => <span className="text-success fw-bold">{row.inDate}</span> },
    { header: 'IN Bill', accessor: 'inBillNo' },
    { header: 'Vendor', accessor: 'vendorName' },
    
    { header: 'OUT Date', render: (row) => <span className="text-danger fw-bold">{row.outDate}</span> },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Account', accessor: 'accountNo' },
  ]

  const fields = [
    { key: 'search', label: 'Search (Item, Tag, Bill)', type: 'text', className: 'col-12 col-md-4' },
    { key: 'dateFrom', label: 'Date From', type: 'date', className: 'col-12 col-md-4' },
    { key: 'dateTo', label: 'Date To', type: 'date', className: 'col-12 col-md-4' },
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
              <h2 className="h4 fw-bold mb-0 text-warning">Gold Stock In / Out Register</h2>
              <p className="small text-secondary mb-0">Filter Gold transactions by Date Range</p>
            </div>
          </div>
          <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(250, 204, 21, 0.12)', color: '#facc15', fontSize: '0.8rem' }}>{data.length} Records</span>
        </div>

        <div className="rounded-3 p-3 p-sm-4 mb-4" style={{ background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)', border: '1px solid rgba(250, 204, 21, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' }}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-8"><DynamicForm fields={fields} formValues={formValues} onChange={onChange} /></div>
            <div className="col-6 col-md-2"><Button text="Search!" className="w-100" onClick={handleSearch} /></div>
            <div className="col-6 col-md-2"><Button text="Clear" className="w-100" onClick={handleClearSearch} /></div>
          </div>
        </div>

        <div className="rounded-3 overflow-hidden" style={{ background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)', border: '1px solid rgba(250, 204, 21, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' }}>
          {loading ? <div className="text-center py-5"><div className="spinner-border text-warning mb-2" role="status" /></div> : data.length === 0 ? <div className="text-center py-5"><div style={{ fontSize: '2.5rem' }}>💎</div><div className="text-secondary mt-2">No Gold records found for this date range</div></div> : <DynamicTable columns={columns} data={data} />}
        </div>
      </div>
    </>
  )
}
export default StockOutRegisterGold