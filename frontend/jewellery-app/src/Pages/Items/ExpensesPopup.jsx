import React, { useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'

const ExpensesPopup = ({ isOpen, onClose, title }) => {
    const [formValues, setFormValues] = useState({})

    const fields = [
        {
            key: 'date',
            label: 'Date *',
            type: 'date',
            className: 'col-span-12 md:col-span-4',
        },
        {
            key: 'type',
            label: 'Income / Expense *',
            type: 'select',
            options: ['Income', 'Expense'],
            className: 'col-span-12 md:col-span-4',
        },
        {
            key: 'amount',
            label: 'Amount *',
            type: 'text',
            className: 'col-span-12 md:col-span-4',
        },
        {
            key: 'remarks',
            label: 'Remarks',
            type: 'text',
            className: 'col-span-12',
        },
    ]

    const onChange = (key, value) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleSubmit = () => {
        console.log('Form Data:', formValues)
        onClose()
    }

    return (
        <DynamicPopup isOpen={isOpen} onClose={onClose} title={title}>
            <DynamicForm
                fields={fields}
                formValues={formValues}
                onChange={onChange}
            />

            <div className="mt-6 flex justify-center">
                <Button
                    text="Submit"
                    className="px-6 py-2 text-sm sm:px-10 sm:py-3 sm:text-base"
                    onClick={handleSubmit}
                />
            </div>
        </DynamicPopup>
    )
}

export default ExpensesPopup