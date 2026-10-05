import React, { useState } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import CustomerDetailsPopup from './CustomerDetailsPopup'
import { FaEdit, FaTrash, FaMoneyCheckAlt } from 'react-icons/fa'

const CustomerDetails = () => {
  const [formValues, setFormValues] = useState({})
  const [isCustomerPopupOpen, setIsCustomerPopupOpen] = useState(false)
  const [isCreditPopupOpen, setIsCreditPopupOpen] = useState(false)
  const [popupTitle, setPopupTitle] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const onChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const fields = [
    {
      key: 'search',
      label: 'Search Customer',
      type: 'text',
      placeholder: 'Enter name, mobile or city...',
      className: 'col-12',
    },
  ]

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Mobile', accessor: 'mobile' },
    { header: 'City', accessor: 'city' },
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
            onClick={() => {
              setSelectedCustomer(row)
              setPopupTitle('Edit Customer')
              setIsCustomerPopupOpen(true)
            }}
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
            onClick={() => {
              if (window.confirm(`Delete ${row.name}?`)) {
                alert('Delete logic here')
              }
            }}
          />
        </div>
      ),
    },
  ]

  const customers = [
    { id: 1, name: 'Rahul Sharma', mobile: '9876543210', city: 'Bhopal' },
    { id: 2, name: 'Priya Verma', mobile: '9876543200', city: 'Indore' },
    { id: 3, name: 'Amit Jain', mobile: '9876543299', city: 'Delhi' },
  ]

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

          <span className="badge rounded-pill px-3 py-2"
            style={{ background: 'rgba(250, 204, 21, 0.12)', color: '#facc15', fontSize: '0.8rem' }}>
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
              <Button text="Search" className="w-100" />
            </div>

            <div className="col-6 col-md-2">
              <Button
                text="+ New Record"
                className="w-100"
                onClick={() => {
                  setSelectedCustomer(null)
                  setPopupTitle('Add New Customer')
                  setIsCustomerPopupOpen(true)
                }}
              />
            </div>
          </div>
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
          <DynamicTable columns={columns} data={customers} />
        </div>

        {/* ============ POPUPS ============ */}
        <CustomerDetailsPopup
          isOpen={isCustomerPopupOpen}
          onClose={() => setIsCustomerPopupOpen(false)}
          title={popupTitle}
          initialValues={selectedCustomer || {}}
        />

        {/* Credit popup — baad mein implement kar sakte hain */}
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