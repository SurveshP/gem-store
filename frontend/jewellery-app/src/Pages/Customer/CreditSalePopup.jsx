import React, { useEffect, useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

const API_CREDIT_SALE = 'http://localhost:5000/api/creditSale'

const CreditSalePopup = ({
  isOpen,
  onClose,
  title,
  customerName = '',
  accountNo = '',
  mobile = '',
}) => {
  const [formValues, setFormValues] = useState({
    clientName: customerName,
    accountNo: accountNo,
    mobile: mobile,
    billDate: '',
    itemDescription: '',
    finalAmount: 0,
    cash: 0,
    oldGold: 0,
    billFinalBalance: 0,
    nextDate: '',
  })

  const [creditSales, setCreditSales] = useState([])
  const [loading, setLoading] = useState(false)

  // =========================
  // AUTO UPDATE CUSTOMER FIELDS
  // =========================
  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      clientName: customerName,
      accountNo: accountNo,
      mobile: mobile,
    }))
  }, [customerName, accountNo, mobile, isOpen])

  // =========================
  // FETCH CREDIT SALES
  // =========================
  useEffect(() => {
    if (!isOpen) return

    if (customerName || mobile) {
      fetchCreditSales()
    } else {
      setCreditSales([])
    }
  }, [isOpen, customerName, mobile])

  const fetchCreditSales = async () => {
    setLoading(true)
    try {
      const url = `${API_CREDIT_SALE}/customer?customerName=${encodeURIComponent(
        customerName
      )}&mobile=${encodeURIComponent(mobile)}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok && data.success) {
        setCreditSales(data.data || [])
      } else {
        toast.error(data.message || 'Failed to fetch credit sales')
      }
    } catch (error) {
      console.log(error)
      toast.error('Server error while fetching credit sales')
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // AUTO CALCULATE BALANCE
  // =========================
  const onChange = (key, value) => {
    setFormValues((prev) => {
      const updated = { ...prev, [key]: value }

      const amount = Number(updated.finalAmount || 0)
      const cash = Number(updated.cash || 0)
      const oldGold = Number(updated.oldGold || 0)

      const balance = amount - (cash + oldGold)
      updated.billFinalBalance = balance < 0 ? 0 : balance

      return updated
    })
  }

  // =========================
  // FORM FIELDS
  // =========================
  const fields = [
    {
      key: 'clientName',
      label: 'Customer Name',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-6',
    },
    {
      key: 'accountNo',
      label: 'Account No',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-6',
    },
    {
      key: 'mobile',
      label: 'Mobile',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-6',
    },
    {
      key: 'billDate',
      label: 'Date',
      type: 'date',
      className: 'col-12 col-md-6',
    },
    {
      key: 'itemDescription',
      label: 'Item Description',
      type: 'text',
      className: 'col-12',
    },
    {
      key: 'finalAmount',
      label: 'Amount',
      type: 'text',
      className: 'col-12 col-md-3',
    },
    {
      key: 'cash',
      label: 'Cash',
      type: 'text',
      className: 'col-12 col-md-3',
    },
    {
      key: 'oldGold',
      label: 'Gold/Swap',
      type: 'text',
      className: 'col-12 col-md-3',
    },
    {
      key: 'billFinalBalance',
      label: 'Balance',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-3',
    },
    {
      key: 'nextDate',
      label: 'Next Due Date',
      type: 'date',
      className: 'col-12 col-md-6',
    },
  ]

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    { header: 'SN', render: (_, index) => index + 1 },
    { header: 'Bill No', accessor: 'billNo' },
    {
      header: 'Date',
      accessor: 'billDate',
    },
    {
      header: 'Item Desc',
      accessor: 'itemDescription',
    },
    {
      header: 'Balance',
      render: (row) => `₹${Number(row.billFinalBalance || 0).toFixed(2)}`,
    },
    {
      header: 'Amount',
      render: (row) => `₹${Number(row.finalAmount || 0).toFixed(2)}`,
    },
    {
      header: 'Next Date',
      accessor: 'nextDate',
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          className="btn btn-link p-0 text-primary"
          style={{ textDecoration: 'none', fontSize: '0.85rem' }}
          onClick={() => handleViewBill(row)}
        >
          View
        </button>
      ),
    },
  ]

  const handleViewBill = (row) => {
    if (row.billNo) {
      // Agar billNo hai to billPrint kholo
      const w = 1200
      const h = 700
      const left = window.screen.width / 2 - w / 2
      const top = window.screen.height / 2.2 - h / 2

      window.open(
        `/billPrint/${row.billingId}`,
        'Popup',
        `width=${w},height=${h},top=${top},left=${left}`
      )
    } else {
      toast.info(`Credit sale #${row.id}`)
    }
  }

  // =========================
  // SAVE CREDIT SALE
  // =========================
  const handleSubmit = () => {
    if (!formValues.finalAmount || Number(formValues.finalAmount) <= 0) {
      toast.error('Amount is required')
      return
    }

    // Format date for API
    const formatDate = (date) => {
      if (!date) return ''
      if (typeof date === 'string') {
        if (date.includes('-')) {
          const parts = date.split('-')
          if (parts[0].length === 4) {
            // YYYY-MM-DD → DD-MM-YYYY
            return `${parts[2]}-${parts[1]}-${parts[0]}`
          }
          return date
        }
      }
      return date
    }

    const payload = {
      billingId: null,
      billNo: '',
      clientName: formValues.clientName,
      accountNo: formValues.accountNo,
      billDate: formatDate(formValues.billDate),
      itemDescription: formValues.itemDescription,
      finalAmount: formValues.finalAmount,
      cash: formValues.cash,
      oldGold: formValues.oldGold,
      nextDate: formatDate(formValues.nextDate),
      mobile: formValues.mobile,
      referredBy: '',
      billFinalBalance: formValues.billFinalBalance,
    }

    const toastId = toast.loading('Saving credit sale...')

    fetch(`${API_CREDIT_SALE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.update(toastId, {
            render: 'Credit sale saved successfully',
            type: 'success',
            isLoading: false,
            autoClose: 2500,
          })

          fetchCreditSales()
          onClose?.(true)
        } else {
          toast.update(toastId, {
            render: data.message || 'Save failed',
            type: 'error',
            isLoading: false,
            autoClose: 3000,
          })
        }
      })
      .catch((err) => {
        console.error(err)
        toast.update(toastId, {
          render: 'Save failed: ' + err.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      })
  }

  // =========================
  // UI
  // =========================
  return (
    <DynamicPopup
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Credit Sale'}
      onSave={handleSubmit}
      saveText="Add to Credit List"
      size="lg"
    >
      {/* ============ FORM ============ */}
      <div
        className="rounded-3 p-3 p-sm-4 mb-4"
        style={{
          background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
          border: '1px solid rgba(250, 204, 21, 0.15)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <h6 className="fw-bold mb-3 text-warning">Credit Details</h6>
        <DynamicForm
          fields={fields}
          formValues={formValues}
          onChange={onChange}
        />
      </div>

      {/* ============ CREDIT SALE HISTORY ============ */}
      {creditSales.length > 0 && (
        <div
          className="rounded-3 p-3 p-sm-4"
          style={{
            background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
            border: '1px solid rgba(250, 204, 21, 0.15)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h6 className="fw-bold mb-3 text-warning">
            Credit Sale History
          </h6>
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-warning" role="status" />
            </div>
          ) : (
            <DynamicTable columns={columns} data={creditSales} />
          )}
        </div>
      )}
    </DynamicPopup>
  )
}

export default CreditSalePopup