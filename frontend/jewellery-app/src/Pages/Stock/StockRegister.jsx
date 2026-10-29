import React, { useState, useEffect } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import { toast } from 'react-toastify'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'

const API_BASE = 'http://localhost:5000/api/stockRegister'

const StockRegister = () => {
  const [activeTab, setActiveTab] = useState('Individual')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState('') //Single Date Filter

  // Popup State
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupTitle, setPopupTitle] = useState('')
  const [historyData, setHistoryData] = useState([])
  const [popupLoading, setPopupLoading] = useState(false)

  const fetchSummary = async (type) => {
    setLoading(true)
    try {
      let url = `${API_BASE}/summary?type=${type}`
      if (dateFilter) {
        const [y, m, d] = dateFilter.split('-')
        url += `&date=${d}/${m}/${y}`
      }

      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch summary')
      setData(json.data || [])
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary(activeTab)
  }, [activeTab])

  const handleSearch = () => fetchSummary(activeTab)
  const handleClearSearch = () => {
    setDateFilter('')
    setTimeout(() => fetchSummary(activeTab), 100)
  }

  const handleOpenHistory = async (row, status) => {
    setPopupTitle(`${status === 'IN' ? 'Stock In' : 'Stock Out'} History: ${row.item}`)
    setIsPopupOpen(true)
    setPopupLoading(true)

    try {
      if (status === 'IN') {
        const res = await fetch(`http://localhost:5000/api/stock/all`)
        const json = await res.json()
        if (json.success) {
          const filtered = json.data.filter(s => s.item === row.item)
          setHistoryData(filtered.map(s => ({
            formatted_date: s.stockBillDate ? new Date(s.stockBillDate).toLocaleDateString('en-GB') : '-',
            billNo: s.billNo, partyName: s.venderName || '-', tagNo: s.tagNo, weight: s.weight
          })))
        }
      } else {
        const res = await fetch(`http://localhost:5000/api/itemsBilling/all`)
        const json = await res.json()
        if (json.success) {
          const filtered = json.data.filter(item => item.itemName === row.item)
          setHistoryData(filtered.map(item => ({
            formatted_date: item.billDate ? new Date(item.billDate).toLocaleDateString('en-GB') : '-',
            billNo: item.billNo, partyName: item.customerName || '-', tagNo: item.tagNo, weight: item.weight
          })))
        }
      }
    } catch (err) {
      toast.error("Failed to load history")
    } finally {
      setPopupLoading(false)
    }
  }

  const columnsIndividual = [
    { header: 'Item Name', accessor: 'item' },
    { header: 'Total Stock In', render: (row) => <span className="text-success fw-bold">{row.stockIn}</span> },
    { header: 'Total Sale Out', render: (row) => <span className="text-danger fw-bold">{row.saleOut}</span> },
    { header: 'Current Stock', render: (row) => <span className="text-warning fw-bold fs-5">{row.current}</span> },
    {
      header: 'Action',
      render: (row) => (
        <div className="d-flex justify-content-center gap-3 fs-5">
          <FaArrowDown role="button" title="View Stock In History" style={{ color: '#22c55e', cursor: 'pointer' }} onClick={() => handleOpenHistory(row, 'IN')} />
          <FaArrowUp role="button" title="View Sale History" style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleOpenHistory(row, 'OUT')} />
        </div>
      ),
    },
  ]

  const columnsGroup = [
    { header: 'Item Name', accessor: 'item' },
    { header: 'Weight In (g)', render: (row) => <span className="text-success fw-bold">{row.stockIn.toFixed(3)}</span> },
    { header: 'Weight Sale (g)', render: (row) => <span className="text-danger fw-bold">{row.saleOut.toFixed(3)}</span> },
    { header: 'Current Weight (g)', render: (row) => <span className="text-warning fw-bold fs-5">{row.current.toFixed(3)}</span> },
    {
      header: 'Action',
      render: (row) => (
        <div className="d-flex justify-content-center gap-3 fs-5">
          <FaArrowDown role="button" title="View Weight In History" style={{ color: '#22c55e', cursor: 'pointer' }} onClick={() => handleOpenHistory(row, 'IN')} />
          <FaArrowUp role="button" title="View Weight Sale History" style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleOpenHistory(row, 'OUT')} />
        </div>
      ),
    },
  ]

  const historyColumns = [
    { header: 'Date', accessor: 'formatted_date' },
    { header: 'Party Name', accessor: 'partyName' },
    { header: 'Tag No', accessor: 'tagNo' },
    { header: 'Weight', render: (row) => <span className="fw-bold">{Number(row.weight).toFixed(3)} g</span> },
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
              <h2 className="h4 fw-bold mb-0 text-warning">Stock Register Summary</h2>
              <p className="small text-secondary mb-0">Item-wise In/Out and Current Stock Report</p>
            </div>
          </div>
        </div>

        {/* TABS + SEARCH BAR */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div className="d-flex gap-2">
            <button className={`btn ${activeTab === 'Individual' ? 'btn-warning' : 'btn-outline-warning'} px-4`} onClick={() => setActiveTab('Individual')}>Individual</button>
            <button className={`btn ${activeTab === 'Group' ? 'btn-warning' : 'btn-outline-warning'} px-4`} onClick={() => setActiveTab('Group')}>Group</button>
          </div>
          <div className="d-flex gap-2" style={{ width: '350px' }}>
            <input type="date" className="form-control" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ background: '#18181b', color: '#fff', border: '1px solid rgba(250,204,21,0.3)' }} />
            <Button text="Search" onClick={handleSearch} />
            <Button text="Clear" onClick={handleClearSearch} />
          </div>
        </div>

        <div className="rounded-3 overflow-hidden" style={{ background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)', border: '1px solid rgba(250, 204, 21, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' }}>
          {loading ? <div className="text-center py-5"><div className="spinner-border text-warning mb-2" role="status" /></div> : data.length === 0 ? <div className="text-center py-5"><div style={{ fontSize: '2.5rem' }}>💎</div><div className="text-secondary mt-2">No records found for {activeTab}</div></div> : <DynamicTable columns={activeTab === 'Individual' ? columnsIndividual : columnsGroup} data={data} />}
        </div>
      </div>

      <DynamicPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} title={popupTitle} size="lg" showFooter={false}>
        <div className="rounded-3 p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
          {popupLoading ? <div className="text-center py-4"><div className="spinner-border text-warning" role="status" /></div> : historyData.length === 0 ? <div className="text-center text-secondary py-4">No history found</div> : <DynamicTable columns={historyColumns} data={historyData} />}
        </div>
      </DynamicPopup>
    </>
  )
}
export default StockRegister