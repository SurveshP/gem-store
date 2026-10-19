import React, { useState, useEffect } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

const API_BILLING = 'http://localhost:5000/api/billing'
const API_ITEMS_BILLING = 'http://localhost:5000/api/itemsBilling'

const BillingPopup = ({ isOpen, onClose, title }) => {
  const [formValues, setFormValues] = useState({})
  const [items, setItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [itemsMaster, setItemsMaster] = useState([])
  const [tagOptions, setTagOptions] = useState([])
  const [isIndividual, setIsIndividual] = useState(false)
  const [savedBillId, setSavedBillId] = useState(null)

  // =========================
  // GET TODAY DATE
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

    fetchCustomers()
    fetchItems()

    const today = getTodayDate()
    setFormValues((prev) => ({
      ...prev,
      billDate: today,
      dueDate: today,
    }))

    setItems([])
    setSavedBillId(null)
    setTagOptions([])
    setIsIndividual(false)
  }, [isOpen])

  // =========================
  // GST CALCULATION
  // =========================
  useEffect(() => {
    const finalAmount = Number(formValues.finalAmount) || 0
    let cgst = 0
    let sgst = 0

    if (formValues.billType === 'Bill' || formValues.billType === 'Bill WG') {
      cgst = (finalAmount * 1.5) / 100
      sgst = (finalAmount * 1.5) / 100
    }

    const finalTotal = Math.round(finalAmount + cgst + sgst)

    setFormValues((prev) => ({
      ...prev,
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      finalTotal,
      balance: finalTotal,
    }))
  }, [formValues.billType, formValues.finalAmount])

  // =========================
  // BALANCE CALCULATION
  // =========================
  useEffect(() => {
    const finalTotal = Number(formValues.finalTotal) || 0
    const cash = Number(formValues.cash) || 0
    const online = Number(formValues.online) || 0
    const oldGold = Number(formValues.oldGold) || 0
    const roundAmount = Number(formValues.roundAmount) || 0

    const balance = finalTotal - (cash + online + oldGold + roundAmount)

    setFormValues((prev) => ({
      ...prev,
      balance: balance.toFixed(2),
    }))
  }, [
    formValues.finalTotal,
    formValues.cash,
    formValues.online,
    formValues.oldGold,
    formValues.roundAmount,
  ])

  // =========================
  // ADDITION ALL = cash + online + oldGold + round
  // =========================
  useEffect(() => {
    const cash = Number(formValues.cash) || 0
    const online = Number(formValues.online) || 0
    const oldGold = Number(formValues.oldGold) || 0
    const roundAmount = Number(formValues.roundAmount) || 0

    const additionAll = cash + online + oldGold + roundAmount

    setFormValues((prev) => ({
      ...prev,
      additionAll: additionAll.toFixed(2),
    }))
  }, [
    formValues.cash,
    formValues.online,
    formValues.oldGold,
    formValues.roundAmount,
  ])

  // =========================
  // AUTO-CALCULATE: makingAmount + totalAmount
  // =========================
  useEffect(() => {
    const amount = Number(formValues.amount) || 0
    const weight = Number(formValues.weight) || 0
    const percent = Number(formValues.percent) || 0
    const makingCharge = formValues.makingCharge

    const baseAmount = amount * weight

    let makingAmount = 0

    if (makingCharge === 'Fixed') {
      makingAmount = Number(formValues.makingAmount) || 0
    } else if (makingCharge === '%') {
      makingAmount = (baseAmount * percent) / 100
    }

    const totalAmount = makingAmount + baseAmount

    if (
      Number(formValues.makingAmount) !== makingAmount ||
      Number(formValues.totalAmount) !== totalAmount
    ) {
      setFormValues((prev) => ({
        ...prev,
        makingAmount: makingAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      }))
    }
  }, [
    formValues.amount,
    formValues.weight,
    formValues.percent,
    formValues.makingCharge,
    formValues.makingAmount,
  ])

  // =========================
  // FETCH CUSTOMERS
  // =========================
  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/customers/active/all'
      )
      const data = await response.json()
      if (response.ok) setCustomers(data.data)
    } catch (error) {
      console.log('Error fetching customers:', error)
    }
  }

  // =========================
  // FETCH ITEMS (stock)
  // =========================
  const fetchItems = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/stock/active/all'
      )
      const data = await response.json()

      if (response.ok) {
        console.log('🔍 Stock items loaded:', data.data)
        setItemsMaster(data.data)
      }
    } catch (error) {
      console.log('Error fetching items:', error)
    }
  }

  // =========================
  // HANDLE CHANGE
  // =========================
  const onChange = (key, value) => {
    if (key === 'customerName') {
      const customer = customers.find((c) => c.customerName === value)
      setFormValues((prev) => ({
        ...prev,
        customerName: value,
        address: customer?.address || '',
        accountNo: customer?.accountNo || '',
        mobile: customer?.mobileNo || '',
        referredBy: customer?.referredBy || '',
      }))
    } else if (key === 'itemName') {
      // ✅ Is item ke saare stock rows
      const selectedRows = itemsMaster.filter((i) => i.item === value)
      const firstRow = selectedRows[0]
      const individual = firstRow?.types === 'Individual'

      setIsIndividual(individual)

      if (individual) {
        // Individual → saare tagNo options dikhao
        const tags = selectedRows.map((i) => i.tagNo)
        setTagOptions(tags)

        // ✅ AUTO-SELECT PEHLA TAG (fix!)
        const firstTagRow = selectedRows[0]

        setFormValues((prev) => ({
          ...prev,
          itemName: value,
          type: firstTagRow?.types || '',
          metalType: firstTagRow?.metalType || '',
          tagNo: firstTagRow?.tagNo || '',
          weight: firstTagRow?.weight || '',
          amount: firstTagRow?.rate || '',
        }))
      } else {
        // Group → tagNo text, direct fill
        setTagOptions([])

        setFormValues((prev) => ({
          ...prev,
          itemName: value,
          type: firstRow?.types || '',
          metalType: firstRow?.metalType || '',
          tagNo: firstRow?.tagNo || '',
          weight: firstRow?.weight || '',
          amount: firstRow?.rate || '',
        }))
      }
    } else if (key === 'tagNo') {
      // User ne tag change kiya — us tag ke hisaab se weight/amount update
      const selectedTag = itemsMaster.find(
        (i) => i.item === formValues.itemName && i.tagNo === value
      )

      setFormValues((prev) => ({
        ...prev,
        tagNo: value,
        type: selectedTag?.types || prev.type,
        metalType: selectedTag?.metalType || prev.metalType,
        weight: selectedTag?.weight || '',
        amount: selectedTag?.rate || '',
      }))
    } else if (key === 'makingCharge') {
      setFormValues((prev) => ({
        ...prev,
        makingCharge: value,
        percent: value === '%' ? prev.percent : '',
      }))
    } else if (key === 'billType') {
      let firstBillNo = ''
      if (value === 'Bill') firstBillNo = 'OSJ-000001'
      else if (value === 'Bill WG') firstBillNo = 'WOSJ-000001'
      else firstBillNo = 'EOSJ-000001'

      fetch(`${API_ITEMS_BILLING}/nextBillNo/${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          setFormValues((prev) => ({
            ...prev,
            billType: value,
            billNo: data.success ? data.billNo : firstBillNo,
          }))
        })
        .catch(() => {
          setFormValues((prev) => ({
            ...prev,
            billType: value,
            billNo: firstBillNo,
          }))
        })
      return
    } else {
      setFormValues((prev) => ({
        ...prev,
        [key]: value,
      }))
    }
  }

  const uniqueItems = [...new Set(itemsMaster.map((i) => i.item))]

  // =========================
  // FIELDS
  // =========================
  const billingFields = [
    {
      key: 'billType',
      label: 'Bill Type',
      type: 'select',
      options: ['Bill', 'Bill WG', 'Estimate'],
      className: 'col-12 col-md-6',
    },
    {
      key: 'billNo',
      label: 'Bill No',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-6',
    },
    {
      key: 'billDate',
      label: 'Bill Date',
      type: 'date',
      disabled: true,
      className: 'col-12 col-md-6',
    },
    {
      key: 'customerName',
      label: 'Client Name',
      type: 'select',
      options: customers.map((c) => c.customerName),
      className: 'col-12 col-md-6',
    },
    {
      key: 'address',
      label: 'Address',
      type: 'text',
      disabled: true,
      className: 'col-12',
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
      key: 'referredBy',
      label: 'Referred By',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-4',
    },
  ]

  const itemFields = [
    {
      key: 'itemName',
      label: 'Item Name',
      type: 'select',
      options: uniqueItems,
      className: 'col-12 col-md-6',
    },
    {
      key: 'tagNo',
      label: 'Tag No',
      type: isIndividual ? 'select' : 'text',
      options: tagOptions,
      className: 'col-12 col-md-6',
    },
    {
      key: 'type',
      label: 'Gold/Silver',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-3',
    },
    {
      key: 'metalType',
      label: 'Metal Type',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-3',
    },
    {
      key: 'weight',
      label: 'Weight',
      type: 'text',
      className: 'col-12 col-md-3',
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-3',
    },
    {
      key: 'itemDesc',
      label: 'Item Description',
      type: 'text',
      className: 'col-12',
    },
    {
      key: 'makingCharge',
      label: 'M_Charges',
      type: 'select',
      options: ['Fixed', '%'],
      className: 'col-12 col-md-3',
    },
    {
      key: 'percent',
      label: 'Percent',
      type: 'text',
      disabled: formValues.makingCharge !== '%',
      className: 'col-12 col-md-3',
    },
    {
      key: 'makingAmount',
      label: 'Making',
      type: 'text',
      disabled: formValues.makingCharge === '%',
      className: 'col-12 col-md-3',
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-3',
    },
  ]

  const gstFields = [
    { key: 'finalAmount', label: 'Amount', type: 'text', className: 'col-12 col-md-4' },
    { key: 'cgst', label: 'CGST', type: 'text', className: 'col-12 col-md-4' },
    { key: 'sgst', label: 'SGST', type: 'text', className: 'col-12 col-md-4' },
    { key: 'finalTotal', label: 'Total', type: 'text', className: 'col-12 col-md-4' },
    { key: 'cash', label: 'Cash', type: 'text', className: 'col-12 col-md-4' },
    { key: 'online', label: 'Online', type: 'text', className: 'col-12 col-md-4' },
    { key: 'oldGold', label: 'Old Gold', type: 'text', className: 'col-12 col-md-6' },
    { key: 'roundAmount', label: 'Round Amount', type: 'text', className: 'col-12 col-md-6' },
    {
      key: 'additionAll',
      label: 'Addition All',
      type: 'text',
      disabled: true,
      className: 'col-12 col-md-6',
    },
    { key: 'balance', label: 'Balance', type: 'text', disabled: true, className: 'col-12 col-md-6' },
    { key: 'dueDate', label: 'Due Date', type: 'date', className: 'col-12 col-md-6' },
    { key: 'remarks', label: 'Remarks', type: 'text', className: 'col-12' },
    { key: 'paymentRemarks', label: 'Payment Remarks', type: 'text', className: 'col-12' },
  ]

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    { header: 'SN', render: (_, index) => index + 1 },
    { header: 'Item', accessor: 'itemName' },
    { header: 'Item Description', accessor: 'itemDesc' },
    { header: 'Tag', accessor: 'tagNo' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Weight', accessor: 'weight' },
    { header: 'Making', accessor: 'makingAmount' },
    { header: 'Total Amount', accessor: 'totalAmount' },
    {
      header: 'Action',
      render: (row) => (
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleDeleteItem(row.id)}
        >
          Delete
        </button>
      ),
    },
  ]

  // =========================
  // ADD ITEM
  // =========================
  const handleAddItem = async () => {
    // 🔒 Validation
    if (!formValues.itemName?.trim()) {
      toast.error('Please select an Item')
      return
    }

    if (!formValues.weight || Number(formValues.weight) <= 0) {
      toast.error('Weight is missing for this item')
      return
    }

    if (!formValues.amount || Number(formValues.amount) <= 0) {
      toast.error('Amount is missing for this item')
      return
    }

    try {
      const formatDateForAPI = (date) => {
        if (!date) return null
        if (date instanceof Date) {
          const day = String(date.getDate()).padStart(2, '0')
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          return `${day}-${month}-${year}`
        }
        if (typeof date === 'string') {
          if (date.includes('/')) {
            const parts = date.split('/')
            return `${parts[0]}-${parts[1]}-${parts[2]}`
          }
          if (date.includes('-')) return date
        }
        return date
      }

      const formattedBillDate = formatDateForAPI(formValues.billDate)

      const payload = {
        billType: formValues.billType,
        billNo: formValues.billNo,
        billDate: formattedBillDate,
        customerName: formValues.customerName,
        itemName: formValues.itemName,
        tagNo: formValues.tagNo,
        type: formValues.type,
        metalType: formValues.metalType,
        weight: formValues.weight,
        amount: formValues.amount,
        itemDesc: formValues.itemDesc,
        makingCharge: formValues.makingCharge,
        percent: formValues.percent || 0,
        makingAmount: formValues.makingAmount,
        totalAmount: formValues.totalAmount,
      }

      console.log('📤 Add Item payload:', payload)

      const response = await fetch(`${API_ITEMS_BILLING}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setItems((prev) => [...prev, data.data])

        if (data.data.type === 'Individual') {
          toast.success('Item added! Stock has been deactivated.')
        } else if (data.data.type === 'Group') {
          toast.success('Item added!')
        } else {
          toast.success(data.message || 'Item added successfully')
        }

        // Clear only item-related fields
        setFormValues((prev) => ({
          ...prev,
          itemName: '',
          tagNo: '',
          type: '',
          metalType: '',
          weight: '',
          amount: '',
          itemDesc: '',
          makingCharge: '',
          percent: '',
          makingAmount: '',
          totalAmount: '',
        }))

        setTagOptions([])
        setIsIndividual(false)
      } else {
        toast.error(data.message || 'Failed to add item')
      }
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    }
  }

  // =========================
  // DELETE ITEM
  // =========================
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    const toastId = toast.loading('Deleting item...')

    try {
      const response = await fetch(`${API_ITEMS_BILLING}/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id))

        toast.update(toastId, {
          render: 'Item deleted successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2500,
        })
      } else {
        toast.update(toastId, {
          render: data.message || 'Failed to delete item',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.log(error)
      toast.update(toastId, {
        render: 'Something went wrong while deleting',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  // =========================
  // ADD AMOUNT
  // =========================
  const handleAddAmount = () => {
    const finalAmount = items.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    )

    setFormValues((prev) => ({
      ...prev,
      finalAmount: finalAmount.toFixed(2),
      cash: 0,
      online: 0,
      oldGold: 0,
    }))
  }

  // =========================
  // PRINT BILL
  // =========================
  const openBillPrint = (billId) => {
    const w = 1200
    const h = 700
    const left = window.screen.width / 2 - w / 2
    const top = window.screen.height / 2.2 - h / 2

    window.open(
      `/billPrint/${billId}`,
      'PrintBill',
      `width=${w},height=${h},top=${top},left=${left}`
    )
  }

  const handlePrintBill = () => {
    if (savedBillId) {
      openBillPrint(savedBillId)
    } else {
      toast.warning('Please save the bill first')
    }
  }

  // =========================
  // SAVE BILLING
  // =========================
  const handleSave = () => {
    if (!formValues.billNo?.toString().trim()) {
      toast.error('Bill No is required')
      return
    }

    if (!formValues.customerName?.trim()) {
      toast.error('Customer Name is required')
      return
    }

    const formatDateForAPI = (date) => {
      if (!date) return null
      if (date instanceof Date) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
      }
      if (typeof date === 'string') {
        if (date.includes('/')) {
          const parts = date.split('/')
          return `${parts[0]}-${parts[1]}-${parts[2]}`
        }
        if (date.includes('-')) {
          const parts = date.split('-')
          if (parts[0].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`
          }
          return date
        }
      }
      return date
    }

    let billDate = formValues.billDate
    let dueDate = formValues.dueDate

    if (billDate instanceof Date) {
      const day = String(billDate.getDate()).padStart(2, '0')
      const month = String(billDate.getMonth() + 1).padStart(2, '0')
      const year = billDate.getFullYear()
      billDate = `${day}-${month}-${year}`
    }

    if (dueDate instanceof Date) {
      const day = String(dueDate.getDate()).padStart(2, '0')
      const month = String(dueDate.getMonth() + 1).padStart(2, '0')
      const year = dueDate.getFullYear()
      dueDate = `${day}-${month}-${year}`
    }

    const formattedBillDate = formatDateForAPI(billDate)
    const formattedDueDate = formatDateForAPI(dueDate)

    const payload = {
      billType: formValues.billType,
      billNo: formValues.billNo,
      billDate: formattedBillDate,
      customerName: formValues.customerName,
      address: formValues.address,
      mobile: formValues.mobile,
      accountNo: formValues.accountNo,
      referredBy: formValues.referredBy,
      finalAmount: formValues.finalAmount,
      cgst: formValues.cgst,
      sgst: formValues.sgst,
      finalTotal: formValues.finalTotal,
      cash: formValues.cash,
      online: formValues.online,
      oldGold: formValues.oldGold,
      roundAmount: formValues.roundAmount,
      additionAll: formValues.additionAll,
      balance: formValues.balance,
      dueDate: formattedDueDate,
      remarks: formValues.remarks,
      paymentRemarks: formValues.paymentRemarks,
    }

    console.log('📤 Save Billing payload:', payload)

    const toastId = toast.loading('Saving billing...')

    fetch(`${API_BILLING}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.update(toastId, {
            render: 'Billing saved successfully',
            type: 'success',
            isLoading: false,
            autoClose: 2500,
          })

          setSavedBillId(data.billingId)
          openBillPrint(data.billingId)

          setTimeout(() => {
            onClose?.(true)
          }, 1500)
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
        console.error('Save error:', err)
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
      title={title || 'Billing Cash / Credit'}
      onSave={handleSave}
      saveText="Save Bill"
      size="xl"
    >
      {savedBillId && (
        <div className="d-flex flex-wrap justify-content-end gap-2 mb-3">
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={handlePrintBill}
          >
            🖨️ Print Bill
          </button>
        </div>
      )}

      <div className="row g-3">
        {/* LEFT */}
        <div className="col-12 col-lg-7">
          <div className="d-flex flex-column gap-3">
            <div
              className="rounded-3 p-3 p-sm-4"
              style={{
                background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
                border: '1px solid rgba(250, 204, 21, 0.15)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              }}
            >
              <h6 className="fw-bold mb-3 text-warning">Billing Details</h6>
              <DynamicForm
                fields={billingFields}
                formValues={formValues}
                onChange={onChange}
              />
            </div>

            <div
              className="rounded-3 p-3 p-sm-4"
              style={{
                background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
                border: '1px solid rgba(250, 204, 21, 0.15)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              }}
            >
              <h6 className="fw-bold mb-3 text-warning">Add Item</h6>
              <DynamicForm
                fields={itemFields}
                formValues={formValues}
                onChange={onChange}
              />
              <div className="mt-3 d-flex justify-content-center">
                <button
                  className="btn btn-warning btn-sm px-4"
                  onClick={handleAddItem}
                >
                  Add Item
                </button>
              </div>
            </div>

            <div
              className="rounded-3 p-3 p-sm-4"
              style={{
                background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
                border: '1px solid rgba(250, 204, 21, 0.15)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              }}
            >
              <DynamicTable columns={columns} data={items} />
              {items.length > 0 && (
                <div className="mt-3 d-flex justify-content-end">
                  <button
                    className="btn btn-warning btn-sm px-4"
                    onClick={handleAddAmount}
                  >
                    Add Amount
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-12 col-lg-5">
          <div className="d-flex flex-column gap-3">
            <div
              className="rounded-3 p-3 p-sm-4"
              style={{
                background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
                border: '1px solid rgba(250, 204, 21, 0.15)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              }}
            >
              <h6 className="fw-bold mb-3 text-warning">GST & Payment</h6>
              <DynamicForm
                fields={gstFields}
                formValues={formValues}
                onChange={onChange}
              />
            </div>

            {savedBillId && (
              <div
                className="rounded-3 p-3 p-sm-4"
                style={{
                  background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
                  border: '1px solid rgba(250, 204, 21, 0.15)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                }}
              >
                <button
                  className="btn btn-outline-warning w-100"
                  onClick={handlePrintBill}
                >
                  🖨️ Print Bill
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DynamicPopup>
  )
}

export default BillingPopup