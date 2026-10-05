import React, { useState } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'
import { FaEdit, FaMoneyCheckAlt, FaTrash } from 'react-icons/fa'
import ItemsPopup from './ItemsPopup'

const ItemsDetails = () => {
    const [formValues, setFormValues] = useState({})
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [popupTitle, setPopupTitle] = useState('')

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Mobile', accessor: 'mobile' },
        { header: 'City', accessor: 'city' },
        {
            header: 'Action',
            render: (row) => (
                <div className="flex gap-4 text-lg">
                    <FaEdit
                        className="cursor-pointer text-yellow-400"
                        onClick={() => {
                            setPopupTitle('Edit Item')
                            setIsPopupOpen(true)
                        }}
                    />
                    <FaTrash className="cursor-pointer text-red-500" />
                </div>
            ),
        },
    ]

    const fields = [
        {
            key: 'search',
            label: 'Search Item',
            type: 'text',
        },
    ]

    const onChange = (key, value) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const items = [
        { id: 1, name: 'Rahul Sharma', mobile: '9876543210', city: 'Bhopal' },
        { id: 2, name: 'Priya Verma', mobile: '9876543200', city: 'Indore' },
        { id: 3, name: 'Amit Jain', mobile: '9876543299', city: 'Delhi' },
    ]

    return (
        <>
            <BreadcrumbNav />
      <CardSection />
            <div className="p-6">

                <h2 className="mb-6 text-3xl font-bold text-yellow-400">
                    Items
                </h2>

                <div className="mb-6 grid gap-7 md:grid-cols-6">
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
                            text="New Record"
                            className="w-full"
                            onClick={() => {
                                setPopupTitle('Add New Items')
                                setIsPopupOpen(true)
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl">
                    <DynamicTable columns={columns} data={items} />
                </div>

                <ItemsPopup
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    title={popupTitle}
                />
            </div>
        </>
    )
}

export default ItemsDetails