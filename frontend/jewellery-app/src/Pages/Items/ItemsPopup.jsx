import React, { useState } from 'react'
import DynamicPopup from '../../Components/Popup/DynamicPopup'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'

const ItemsPopup = ({ isOpen, onClose, title }) => {
    const [formValues, setFormValues] = useState({})

  const fields = [
      { key: 'itemName', label: 'Item Name *', type: 'text', className: 'col-span-12 md:col-span-12' },
        { key: 'itemType', label: 'Item Types *', type: 'text', className: 'col-span-12 md:col-span-4' },
        { key: 'shortName', label: 'Short Name *', type: 'text', className: 'col-span-12 md:col-span-4' },
        { key: 'tagNo', label: 'Tag No *', type: 'text', className: 'col-span-12 md:col-span-4' },
    ]

    const onChange = (key, value) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    return (
        <DynamicPopup
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <DynamicForm
                fields={fields}
                formValues={formValues}
                onChange={onChange}
            />

            <div className="mt-6 flex justify-center">
                <Button
                    text="Save Item"
                    className="px-6 py-2 text-sm sm:px-10 sm:py-3 sm:text-base"
                />
            </div>
        </DynamicPopup>
    )
}

export default ItemsPopup