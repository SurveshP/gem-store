import React, { useEffect, useState, useCallback } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import CustomerDetailsPopup from './CustomerDetailsPopup'
import { FaEdit, FaTrash, FaMoneyCheckAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/customers'

const CustomerDetails = () => {
  const [formValues, setFormValues] = useState({})
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isCustomerPopupOpen, setIsCustomerPopupOpen] = useState(false)
  const [isCreditPopupOpen, setIsCreditPopupOpen] = useState(false)
  const [popupTitle, setPopupTitle] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = useCallback(async (searchText = '') => {
    setLoading(true)
    // const toastId = toast.loading('Loading customers...')

    try {
      const url = searchText.trim()
        ? `${API_BASE}/search/data?search=${encodeURIComponent(searchText.trim())}`
        : API_BASE

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch customers')
      }

      setCustomers(data.data || [])
      // toast.update(toastId, {
      //   // render: `${data.data?.length || 0} customers loaded`,
      //   type: 'success',
      //   isLoading: false,
      //   autoClose: 2000,
      // })
    } catch (err) {
      console.error(err)
      toast.update(toastId, {
        render: err.message || 'Failed to fetch customers',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // First load pe fetch
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // ================= HANDLERS =================
  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchCustomers(formValues.search || '')
  }

  const handleClearSearch = () => {
    setFormValues((prev) => ({ ...prev, search: '' }))
    fetchCustomers('')
  }

  const handleAddNew = () => {
    setSelectedCustomer(null)
    setPopupTitle('Add New Customer')
    setIsCustomerPopupOpen(true)
  }

  const handleEdit = (row) => {
    setSelectedCustomer(row)
    setPopupTitle('Edit Customer')
    setIsCustomerPopupOpen(true)
  }

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Delete ${row.customerName}?`)
    if (!confirmed) return

    const toastId = toast.loading('Deleting customer...')

    try {
      const res = await fetch(`${API_BASE}/delete/${row.id}`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Delete failed')
      }

      toast.update(toastId, {
        render: 'Customer deleted successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      })

      // Refresh list
      fetchCustomers(formValues.search || '')
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
    setIsCustomerPopupOpen(false)
    setSelectedCustomer(null)

    if (refresh) {
      // Popup ke save hone ke baad list refresh
      fetchCustomers(formValues.search || '')
    }
  }

  // ================= TABLE CONFIG =================
  const fields = [
    {
      key: 'search',
      label: 'Search Customer',
      type: 'text',
      placeholder: 'Enter name, mobile, account no, PAN...',
      className: 'col-12',
    },
  ]

  const columns = [
    {
      header: 'Photo',
      render: (row) =>
        row.photo ? (
          <img
            src={`http://localhost:5000${row.photo}`}
            alt={row.customerName}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(250, 204, 21, 0.4)',
            }}
          />
        ) : (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'rgba(250, 204, 21, 0.1)',
              border: '2px solid rgba(250, 204, 21, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#facc15',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {row.customerName?.charAt(0)?.toUpperCase() || '?'}
          </div>
        ),
    },
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'customerName' },
    { header: 'Account No', accessor: 'accountNo' },
    { header: 'Mobile', accessor: 'mobileNo' },
    { header: 'Address', accessor: 'address' },
    { header: 'PAN', accessor: 'pan' },
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
            title="Edit Customer"
            style={{ color: '#facc15', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => handleEdit(row)}
          />

          <FaMoneyCheckAlt
            role="button"
            title="Credit Sale"
            style={{ color: '#fb923c', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => {
              setSelectedCustomer(row)
              setPopupTitle('Credit Sale')
              setIsCreditPopupOpen(true)
            }}
          />

          <FaTrash
            role="button"
            title="Delete Customer"
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

        {/* ============ PAGE HEADER ============ */}
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
              <h2 className="h4 fw-bold mb-0 text-warning">Customer Details</h2>
              <p className="small text-secondary mb-0">
                Manage all your jewellery customers here
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
            {customers.length} Records
          </span>
        </div>

        {/* ============ SEARCH + ACTIONS PANEL ============ */}
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

        {/* ============ TABLE ============ */}
        <div
          className="rounded-3 overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
            border: '1px solid rgba(250, 204, 21, 0.15)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          {loading ? (
            <div className="text-center py-5 text-warning">
              <div className="spinner-border text-warning mb-2" role="status" />
              {/* <div style={{ fontSize: '0.85rem' }}>Loading customers...</div> */}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <div className="text-secondary mt-2">No customers found</div>
              <div
                style={{ fontSize: '0.8rem', color: '#71717a' }}
                className="mt-1"
              >
                Click <span className="text-warning">+ New Record</span> to add one
              </div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={customers} />
          )}
        </div>

        {/* ============ POPUPS ============ */}
        <CustomerDetailsPopup
          isOpen={isCustomerPopupOpen}
          onClose={handlePopupClose}
          title={popupTitle}
          initialValues={selectedCustomer || {}}
        />

        {isCreditPopupOpen && (
          <CustomerDetailsPopup
            isOpen={isCreditPopupOpen}
            onClose={() => setIsCreditPopupOpen(false)}
            title={popupTitle}
            initialValues={selectedCustomer || {}}
          />
        )}
      </div>
    </>
  )
}

export default CustomerDetails