import React, { useEffect, useState, useCallback } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { FaEdit, FaMoneyCheckAlt, FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import ItemsPopup from './ItemsPopup'

const API_BASE = 'http://localhost:5000/api/items'

const ItemsDetails = () => {
  const [formValues, setFormValues] = useState({})
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupTitle, setPopupTitle] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  // ================= FETCH ITEMS =================
  const fetchItems = useCallback(async (searchText = '') => {
    setLoading(true)

    try {
      const url = searchText.trim()
        ? `${API_BASE}/search/data?search=${encodeURIComponent(searchText.trim())}`
        : API_BASE

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch items')
      }

      setItems(data.data || [])
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // ================= HANDLERS =================
  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchItems(formValues.search || '')
  }

  const handleClearSearch = () => {
    setFormValues((prev) => ({ ...prev, search: '' }))
    fetchItems('')
  }

  const handleAddNew = () => {
    setSelectedItem(null)
    setPopupTitle('Add New Item')
    setIsPopupOpen(true)
  }

  const handleEdit = (row) => {
    setSelectedItem(row)
    setPopupTitle('Edit Item')
    setIsPopupOpen(true)
  }

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Delete ${row.itemName}?`)
    if (!confirmed) return

    const toastId = toast.loading('Deleting item...')

    try {
      const res = await fetch(`${API_BASE}/delete/${row.id}`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Delete failed')
      }

      toast.update(toastId, {
        render: 'Item deleted successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      })

      fetchItems(formValues.search || '')
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
    setSelectedItem(null)

    if (refresh) {
      fetchItems(formValues.search || '')
    }
  }

  // ================= TABLE CONFIG =================
  const fields = [
    {
      key: 'search',
      label: 'Search Item',
      type: 'text',
      placeholder: 'Enter item name, type, tag no...',
      className: 'col-12',
    },
  ]

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Item Name', accessor: 'itemName' },
    { header: 'Item Type', accessor: 'itemType' },
    { header: 'Short Name', accessor: 'shortName' },
    { header: 'Tag No', accessor: 'tagNo' },
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
            title="Edit Item"
            style={{ color: '#facc15', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => handleEdit(row)}
          />

          <FaTrash
            role="button"
            title="Delete Item"
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
              <h2 className="h4 fw-bold mb-0 text-warning">Items</h2>
              <p className="small text-secondary mb-0">
                Manage all your jewellery items here
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
            {items.length} Records
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
          ) : items.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <div className="text-secondary mt-2">No items found</div>
              <div
                style={{ fontSize: '0.8rem', color: '#71717a' }}
                className="mt-1"
              >
                Click <span className="text-warning">+ New Record</span> to add one
              </div>
            </div>
          ) : (
            <DynamicTable columns={columns} data={items} />
          )}
        </div>

        {/* POPUP */}
        <ItemsPopup
          isOpen={isPopupOpen}
          onClose={handlePopupClose}
          title={popupTitle}
          initialValues={selectedItem || {}}
        />
      </div>
    </>
  )
}

export default ItemsDetails