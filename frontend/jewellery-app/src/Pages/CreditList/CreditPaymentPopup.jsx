import React, { useEffect, useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

// API endpoints
const API_CREDIT_PAYMENT = 'http://localhost:5000/api/creditPayment'

const CreditPaymentPopup = ({
  isOpen,
  onClose,
  title,
  clientName = '',
  accountNo = '',
  mobile = '',
  finalAmount = 0,
  finalBalance = 0,
  billingId = null,
  billNo = '',
}) => {
  const [formValues, setFormValues] = useState({
    billingId: billingId,
    billNo: billNo,
    clientName: clientName,
    accountNo: accountNo,
    mobile: mobile,
    currentDate: '',
    paymentName: '',
    amount: finalBalance,
    pay: 0,
    oldGold: 0,
    textSwapOnline: 'Swap',
    swap: 0,
    round: 0,
    balance: '',
    remark: '',
    dueDate: '',
    addition: 0,
  })

  const [paymentHistory, setPaymentHistory] = useState([])
  const [loading, setLoading] = useState(false)

  // =========================
  // GET TODAY DATE (YYYY-MM-DD for input)
  // =========================
  const getTodayDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${year}-${month}-${day}`
  }

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    if (!isOpen) return

    setFormValues((prev) => ({
      ...prev,
      clientName,
      accountNo,
      mobile,
      amount: finalBalance,
      currentDate: getTodayDate(),
    }))

    // Fetch history if accountNo
    if (accountNo) {
      fetchPaymentHistory()
    } else {
      setPaymentHistory([])
    }
  }, [isOpen, clientName, accountNo, mobile, finalAmount, finalBalance])

  // =========================
  // FETCH PAYMENT HISTORY
  // =========================
  const fetchPaymentHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${API_CREDIT_PAYMENT}/customer?accountNo=${encodeURIComponent(accountNo)}`
      )
      const data = await response.json()

      if (response.ok && data.success) {
        setPaymentHistory(data.data || [])
      }
    } catch (error) {
      console.log('Error fetching payment history:', error)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // AUTO CALCULATE
  // =========================
  const onChange = (key, value) => {
    setFormValues((prev) => {
      const updated = { ...prev, [key]: value }

      const amount = Number(updated.amount || 0)
      const pay = Number(updated.pay || 0)
      const oldGold = Number(updated.oldGold || 0)
      const swap = Number(updated.swap || 0)
      const round = Number(updated.round || 0)

      // addition = pay + oldGold + swap + round
      const addition = pay + oldGold + swap + round

      // balance = amount - addition
      const balance = amount - addition

      updated.addition = addition.toFixed(2)
      updated.balance = balance < 0 ? 0 : balance

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
      className: 'col-12 col-md-4',
    },
    {
      key: 'accountNo',
      label: 'Account No',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-4',
    },
    {
      key: 'mobile',
      label: 'Mobile',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-4',
    },
    {
      key: 'currentDate',
      label: 'Current Date *',
      type: 'date',
      className: 'col-12 col-md-3',
    },
    {
      key: 'paymentName',
      label: 'Payment Collected By *',
      type: 'text',
      className: 'col-12 col-md-6',
    },
    {
      key: 'amount',
      label: 'Amount *',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-3',
    },
    {
      key: 'pay',
      label: 'Pay',
      type: 'text',
      className: 'col-12 col-md-2',
    },
    {
      key: 'oldGold',
      label: 'Old Gold',
      type: 'text',
      className: 'col-12 col-md-2',
    },
    {
      key: 'textSwapOnline',
      label: 'Swap/Online',
      type: 'select',
      options: ['Swap', 'Online'],
      className: 'col-12 col-md-2',
    },
    {
      key: 'swap',
      label: 'Swap',
      type: 'text',
      className: 'col-12 col-md-2',
    },
    {
      key: 'round',
      label: 'Round',
      type: 'text',
      className: 'col-12 col-md-2',
    },
    {
      key: 'addition',
      label: 'Addition',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-2',
    },
    {
      key: 'balance',
      label: 'Balance *',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-3',
    },
    {
      key: 'remark',
      label: "Remark's *",
      type: 'text',
      className: 'col-12 col-md-9',
    },
    {
      key: 'dueDate',
      label: 'Next Due Date *',
      type: 'date',
      className: 'col-12 col-md-4',
    },
  ]

  // =========================
  // TABLE COLUMNS (Payment History)
  // =========================
  const columns = [
    { header: 'SN', render: (_, index) => index + 1 },
    {
      header: 'Date',
      accessor: 'currentDate',
    },
    {
      header: 'Time',
      accessor: 'currentTime',
    },
    {
      header: 'AMT',
      render: (row) => `₹${Number(row.amount || 0).toFixed(2)}`,
    },
    {
      header: 'PAY',
      render: (row) => (
        <span className="fw-bold text-warning">
          ₹{Number(row.pay || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Old Gold',
      render: (row) => `₹${Number(row.oldGold || 0).toFixed(2)}`,
    },
    {
      header: 'Swap',
      render: (row) => `₹${Number(row.swap || 0).toFixed(2)}`,
    },
    {
      header: 'Round',
      render: (row) => `₹${Number(row.round || 0).toFixed(2)}`,
    },
    {
      header: 'Collected',
      // render: () => '-',
      accessor: 'paymentName',
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          className="btn btn-link p-0 text-danger"
          style={{ textDecoration: 'none', fontSize: '0.9rem' }}
          onClick={() => handleDeletePayment(row.id)}
        >
          🗑️
        </button>
      ),
    },
  ]

  // =========================
  // DELETE PAYMENT
  // =========================
  const handleDeletePayment = async (id) => {
    if (!window.confirm('Do you want to delete this payment record?')) return

    const toastId = toast.loading('Deleting payment...')

    try {
      const response = await fetch(`${API_CREDIT_PAYMENT}/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setPaymentHistory((prev) => prev.filter((p) => p.id !== id))

        toast.update(toastId, {
          render: 'Payment deleted successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2500,
        })
      } else {
        toast.update(toastId, {
          render: data.message || 'Failed to delete payment',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.update(toastId, {
        render: 'Something went wrong',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = () => {
    if (!formValues.paymentName?.trim()) {
      toast.error('Payment Collected By is required')
      return
    }

    if (!formValues.pay || Number(formValues.pay) <= 0) {
      toast.error('Please enter Pay amount')
      return
    }

    if (!formValues.remark?.trim()) {
      toast.error('Remark is required')
      return
    }

    //UPDATED FORMAT DATE FUNCTION
    const formatDate = (date) => {
      if (!date) return ''

      let d
      if (date instanceof Date) {
        d = date
      } else if (typeof date === 'string') {
        // Agar string mein 'T' hai (ISO format), toh direct new Date() use karo
        // Agar HTML date string hai (YYYY-MM-DD), toh new Date() use karo
        d = new Date(date)
      } else {
        return date
      }

      // Check karo ki valid date hai ya nahi
      if (isNaN(d.getTime())) return date

      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()

      // Final output: DD-MM-YYYY
      return `${day}-${month}-${year}`
    }

    // Get current time
    const now = new Date()
    const currentTime =
      now.getHours() +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0')

    const payload = {
      billingId: formValues.billingId,
      billNo: formValues.billNo,
      clientName: formValues.clientName,
      accountNo: formValues.accountNo,
      mobile: formValues.mobile,
      currentDate: formatDate(formValues.currentDate),      // -> DD-MM-YYYY
      currentTime,
      paymentName: formValues.paymentName,
      amount: formValues.amount,
      pay: formValues.pay,
      oldGold: formValues.oldGold,
      textSwapOnline: formValues.textSwapOnline,
      swap: formValues.swap,
      round: formValues.round,
      addition: formValues.addition,
      balance: formValues.balance,
      remark: formValues.remark,
      dueDate: formatDate(formValues.dueDate),              // -> DD-MM-YYYY
    }

    console.log('📤 Payment payload:', payload)

    const toastId = toast.loading('Saving payment...')

    fetch(`${API_CREDIT_PAYMENT}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.update(toastId, {
            render: 'Payment saved successfully',
            type: 'success',
            isLoading: false,
            autoClose: 2500,
          })

          fetchPaymentHistory()

          // Reset form (except customer fields)
          setFormValues((prev) => ({
            ...prev,
            currentDate: getTodayDate(),
            paymentName: '',
            pay: 0,
            oldGold: 0,
            swap: 0,
            round: 0,
            balance: prev.amount,
            remark: '',
            dueDate: '',
            addition: 0,
          }))
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
          render: 'Save Failed: ' + err.message,
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
      title={title || 'Credit Payment'}
      onSave={handleSubmit}
      saveText="Submit"
      size="xl"
    >
      {/* ============ INFO ============ */}
      <div
        className="rounded-3 p-3 p-sm-4 mb-4"
        style={{
          background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
          border: '1px solid rgba(250, 204, 21, 0.15)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <h6 className="fw-bold mb-1 text-warning">Credit Payment</h6>
        <p className="small text-secondary mb-3">
          Note: * - Indicates required fields
        </p>

        <DynamicForm
          fields={fields}
          formValues={formValues}
          onChange={onChange}
        />
      </div>

      {/* ============ PAYMENT HISTORY ============ */}
      <div
        className="rounded-3 p-3 p-sm-4"
        style={{
          background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
          border: '1px solid rgba(250, 204, 21, 0.15)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <h6 className="fw-bold mb-3 text-warning">Payment History</h6>

        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-warning" role="status" />
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="text-center py-3 text-secondary small">
            No payment records yet
          </div>
        ) : (
          <DynamicTable columns={columns} data={paymentHistory} />
        )}
      </div>
    </DynamicPopup>
  )
}

export default CreditPaymentPopup