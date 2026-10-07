// ===============================
// StockInDetailsGroupPopup.jsx
// ===============================

import React, { useEffect, useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { toast } from 'react-toastify'

const StockInDetailsGroupPopup = ({
    isOpen,
    onClose,
    title,
    editData,
    fetchStock,
}) => {
    const [form, setForm] = useState({})
    const [itemsList, setItemsList] = useState([])
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    // =========================
    // FETCH ACTIVE ITEMS
    // =========================
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(
                    'http://localhost:5000/api/items/active/all'
                )
                const data = await response.json()
                if (response.ok) setItemsList(data.data || [])
            } catch (error) {
                console.log(error)
            }
        }
        fetchItems()
    }, [])

    // =========================
    // FETCH HISTORY
    // =========================
    const fetchHistory = async (stockId) => {
        setHistoryLoading(true)
        try {
            const response = await fetch(
                `http://localhost:5000/api/stock/group-history/${stockId}`
            )
            const data = await response.json()
            if (response.ok) setHistory(data.data || [])
        } catch (error) {
            console.log(error)
        } finally {
            setHistoryLoading(false)
        }
    }

    // =========================
    // SET EDIT DATA + FETCH HISTORY
    // =========================
    useEffect(() => {
        if (!isOpen) return

        if (editData) {
            setForm({
                billNo: editData.billNo,
                billDate: editData.stockBillDate?.split('T')[0],
                vendorName: editData.venderName,
                item: editData.item,
                type: editData.types,
                tagNo: editData.tagNo,
                carat: editData.carat,
                weight: editData.weight,
                addWeight: '',
                rate: editData.rate,
                lastTag: editData.lastTag,
                type2: editData.metalType,
            })

            fetchHistory(editData.id)
        }
    }, [editData, isOpen])

    // =========================
    // HANDLE CHANGE
    // =========================
    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    // =========================
    // FORM FIELDS
    // =========================
    const fields = [
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
            className: 'col-12 col-md-6',
        },
        {
            key: 'vendorName',
            label: 'Vendor Name',
            type: 'text',
            className: 'col-12 col-md-6',
        },
        {
            key: 'item',
            label: 'Item',
            type: 'text',
            disabled: true,
            className: 'col-12 col-md-6',
        },
        {
            key: 'type',
            label: 'Types',
            type: 'text',
            disabled: true,
            className: 'col-12 col-md-6',
        },
        {
            key: 'tagNo',
            label: 'Tag No',
            type: 'text',
            disabled: true,
            className: 'col-12 col-md-6',
        },
        {
            key: 'carat',
            label: 'Carat',
            type: 'select',
            options: ['18K', '22K', '24K'],
            className: 'col-12 col-md-6',
        },
        {
            key: 'weight',
            label: 'Current Total Weight',
            type: 'text',
            disabled: true,
            className: 'col-12 col-md-6',
        },
        {
            key: 'addWeight',
            label: 'Add Weight',
            type: 'text',
            className: 'col-12 col-md-6',
        },
        {
            key: 'rate',
            label: 'Rate',
            type: 'text',
            className: 'col-12 col-md-6',
        },
        {
            key: 'type2',
            label: 'Metal Type',
            type: 'select',
            options: ['Gold', 'Silver'],
            className: 'col-12 col-md-6',
        },
    ]

    // =========================
    // HISTORY TABLE COLUMNS
    // =========================
    const historyColumns = [
        {
            header: '#',
            render: (row, index) => index + 1,
        },
        {
            header: 'Added Weight',
            render: (row) => (
                <span className="text-warning fw-bold">+{row.weight}</span>
            ),
        },
        {
            header: 'Previous',
            accessor: 'previousWeight',
        },
        {
            header: 'New Total',
            render: (row) => (
                <span className="text-success fw-bold">{row.newWeight}</span>
            ),
        },
        {
            header: 'Date',
            render: (row) => (
                <span className="small text-secondary">
                    {new Date(row.addedAt).toLocaleString()}
                </span>
            ),
        },
    ]

    // =========================
    // UPDATE (ADD WEIGHT)
    // =========================
    const handleUpdateStock = async () => {
        const addWeight = parseFloat(form.addWeight)

        if (!form.addWeight || isNaN(addWeight) || addWeight <= 0) {
            toast.error('Please enter a valid weight to add')
            return
        }

        const payload = {
            types: 'Group',
            addWeight: addWeight,
            carat: form.carat,
            rate: form.rate,
            metalType: form.type2,
        }

        const toastId = toast.loading('Adding weight...')

        try {
            const response = await fetch(
                `http://localhost:5000/api/stock/${editData.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                toast.update(toastId, {
                    render: data.message || 'Update failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                })
                return
            }

            toast.update(toastId, {
                render: `Weight added! New total: ${data.data.newWeight}`,
                type: 'success',
                isLoading: false,
                autoClose: 2500,
            })

            setForm((prev) => ({
                ...prev,
                weight: data.data.newWeight,
                addWeight: '',
            }))
            fetchHistory(editData.id)
            fetchStock()
        } catch (error) {
            console.log(error)
            toast.update(toastId, {
                render: 'Network error. Please try again.',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            })
        }
    }

    // =========================
    // UI
    // =========================
    return (
        <DynamicPopup
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            onSave={handleUpdateStock}
            saveText="Add Weight"
        >
            <DynamicForm
                fields={fields}
                formValues={form}
                onChange={handleChange}
            />

            {/* ============ HISTORY TABLE ============ */}
            <div className="mt-4">
                <h6
                    className="mb-3 fw-bold"
                    style={{ color: '#facc15' }}
                >
                    Weight Addition History
                </h6>

                <div
                    className="rounded-3 overflow-hidden"
                    style={{
                        border: '1px solid rgba(250, 204, 21, 0.2)',
                    }}
                >
                    {historyLoading ? (
                        <div className="text-center py-4">
                            <div
                                className="spinner-border text-warning"
                                role="status"
                            />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-4 text-secondary small">
                            No history yet
                        </div>
                    ) : (
                        <DynamicTable
                            columns={historyColumns}
                            data={history}
                        />
                    )}
                </div>
            </div>
        </DynamicPopup>
    )
}

export default StockInDetailsGroupPopup