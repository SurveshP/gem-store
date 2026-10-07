// ===============================
// StockInDetailsPopup.jsx
// ===============================

import React, { useEffect, useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import { toast } from 'react-toastify'

const StockInDetailsPopup = ({
    isOpen,
    onClose,
    title,
    editData,
    fetchStock,
}) => {
    const [form, setForm] = useState({})
    const [itemsList, setItemsList] = useState([])

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
                if (response.ok) {
                    setItemsList(data.data || [])
                }
            } catch (error) {
                console.log(error)
                toast.error('Failed to load items')
            }
        }
        fetchItems()
    }, [])

    // =========================
    // HANDLE CHANGE
    // =========================
    const handleChange = async (key, value) => {
        if (key === 'item') {
            // ✅ Sahi field: itemName se match karo
            const selectedItem = itemsList.find(
                (i) => i.itemName === value
            )

            // ✅ Sahi field: itemType
            const selectedType = selectedItem?.itemType || ''

            let lastTag = ''

            try {
                const response = await fetch(
                    `http://localhost:5000/api/stock/last-tag?item=${encodeURIComponent(value)}&types=${encodeURIComponent(selectedType)}`
                )
                const data = await response.json()
                if (response.ok) {
                    lastTag = data.lastTag
                }
            } catch (error) {
                console.log(error)
            }

            setForm((prev) => ({
                ...prev,
                item: value,
                type: selectedType,         // 🔁 auto set type
                tagNo: selectedItem?.tagNo || '',
                lastTag,
            }))
        } else {
            setForm((prev) => ({
                ...prev,
                [key]: value,
            }))
        }
    }

    // =========================
    // FETCH NEXT BILL NO (only Add mode)
    // =========================
    useEffect(() => {
        if (!isOpen || editData) return

        const fetchBillNo = async () => {
            try {
                const response = await fetch(
                    'http://localhost:5000/api/stock/next-bill-no'
                )
                const data = await response.json()
                if (response.ok) {
                    setForm((prev) => ({
                        ...prev,
                        billNo: data.billNo,
                    }))
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchBillNo()
    }, [isOpen, editData])

    // =========================
    // SET EDIT DATA / RESET FORM
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
                rate: editData.rate,
                lastTag: editData.lastTag,
                type2: editData.metalType,
            })
        } else {
            const today = new Date()
            const formatted = today.toISOString().split('T')[0]

            setForm({
                billNo: '',
                billDate: formatted,
                vendorName: '',
                item: '',
                type: '',
                tagNo: '',
                carat: '',
                weight: '',
                rate: '',
                lastTag: '',
                type2: '',
            })
        }
    }, [editData, isOpen])

    // =========================
    // FORM FIELDS (Bootstrap — 2 per row)
    // =========================
    const fields = [
        {
            key: 'billNo',
            label: 'Bill No',
            type: 'text',
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
            type: 'select',
            // ✅ Sahi field: itemName
            options: itemsList.map((item) => item.itemName),
            className: 'col-12 col-md-6',
        },
        {
            // 🔁 select se text kar diya
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
            label: 'Weight',
            type: 'text',
            className: 'col-12 col-md-6',
        },
        {
            key: 'lastTag',
            label: 'Last Tag',
            type: 'text',
            disabled: true,
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
    // SAVE STOCK
    // =========================
    const handleSaveStock = async () => {
        if (!form.billNo?.toString().trim()) {
            toast.error('Bill No is required')
            return
        }

        if (!form.item?.trim()) {
            toast.error('Item is required')
            return
        }

        const isEdit = !!editData?.id

        const payload = {
            billNo: form.billNo,
            stockBillDate: form.billDate,
            venderName: form.vendorName,
            item: form.item,
            types: form.type,
            tagNo: form.tagNo,
            carat: form.carat,
            weight: form.weight,
            rate: form.rate,
            lastTag: form.lastTag,
            metalType: form.type2,
        }

        const toastId = toast.loading(isEdit ? 'Updating stock...' : 'Saving stock...')

        try {
            const url = isEdit
                ? `http://localhost:5000/api/stock/${editData.id}`
                : 'http://localhost:5000/api/stock/'

            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                toast.update(toastId, {
                    render: data.message || 'Operation failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                })
                return
            }

            toast.update(toastId, {
                render: isEdit ? 'Stock updated successfully' : 'Stock created successfully',
                type: 'success',
                isLoading: false,
                autoClose: 2500,
            })

            onClose?.(true)
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
            onSave={handleSaveStock}
            saveText={editData ? 'Update Stock' : 'Save Stock'}
        >
            <DynamicForm
                fields={fields}
                formValues={form}
                onChange={handleChange}
            />
        </DynamicPopup>
    )
}

export default StockInDetailsPopup