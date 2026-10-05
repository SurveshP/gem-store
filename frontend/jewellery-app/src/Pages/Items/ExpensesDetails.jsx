import React, { useState } from 'react'
import DynamicForm from '../../Components/Form/DynamicForm'
import DynamicTable from '../../Components/Tables/DynamicTable'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import { FaEdit, FaTrash } from 'react-icons/fa'
import CardSection from '../Home/CardSection'
import ExpensesPopup from './ExpensesPopup'

const ExpensesDetails = () => {
    const [formValues, setFormValues] = useState({})
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [popupTitle, setPopupTitle] = useState('')

    const onChange = (key, value) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    // 🔹 Search Field
    const fields = [
        {
            key: 'search',
            label: 'Search by Date',
            type: 'date',
        },
    ]

    // 🔹 Table Columns
    const columns = [
        { header: 'SN', render: (_, i) => i + 1 },
        { header: 'Date', accessor: 'date' },
        { header: 'Income', accessor: 'income' },
        { header: 'Expense', accessor: 'expense' },
        { header: 'Remark', accessor: 'remark' },
        {
            header: 'Action',
            render: (row) => (
                <div className="flex justify-center gap-3 text-lg">
                    <FaEdit
                        className="cursor-pointer text-green-400"
                        onClick={() => alert('Edit ' + row.date)}
                    />
                    <FaTrash
                        className="cursor-pointer text-red-500"
                        onClick={() => {
                            if (window.confirm('Delete this record?')) {
                                alert('Deleted ' + row.date)
                            }
                        }}
                    />
                </div>
            ),
        },
    ]

    // 🔹 Dummy Data (Replace with API)
    const data = [
        {
            date: '01/02/2024',
            income: 10000,
            expense: 4000,
            remark: 'Office Expense',
        },
        {
            date: '02/02/2024',
            income: 8000,
            expense: 2000,
            remark: 'Transport',
        },
    ]

    return (
        <>
            <BreadcrumbNav />
            <CardSection />

            <div className="p-4 sm:p-6">
                {/* Header */}
                <h2 className="mb-6 text-3xl font-bold text-yellow-400">
                    Income / Expenses
                </h2>

                {/* 🔶 Filter Card */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-7">
                    <div className="md:col-span-4">
                        <DynamicForm
                            fields={fields}
                            formValues={formValues}
                            onChange={onChange}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <Button text="Search" className="w-full" />
                    </div>

                    <div className="md:col-span-1">
                        <Button
                            text="+ New Record"
                            className="w-full"
                            onClick={() => {
                                setPopupTitle('Add Income / Expense')
                                setIsPopupOpen(true)
                            }}
                        />
                    </div>
                </div>

                <p className="-mt-5 mb-3 text-sm text-zinc-400">
                    Filter By [Date]
                </p>

                {/* 🔶 Table */}
                <div className="overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl">
                    <DynamicTable columns={columns} data={data} />
                </div>

                <ExpensesPopup
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    title={popupTitle}
                />

            </div>
        </>
    )
}

export default ExpensesDetails