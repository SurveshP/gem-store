import React, { useState } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import DynamicTable from '../../Components/Tables/DynamicTable'

const TagwiseReport = () => {
  const [formValues, setFormValues] = useState({})

  const onChange = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // 🔹 Form Fields (Date From / To)
  const fields = [
    {
      key: 'dateFrom',
      label: 'Date From',
      type: 'date',
      className: 'col-span-12 md:col-span-6',
    },
    {
      key: 'dateTo',
      label: 'Date To',
      type: 'date',
      className: 'col-span-12 md:col-span-6',
    },
  ]

  // 🔹 Table Columns
  const columns = [
    { header: 'SN', render: (row, index) => index + 1 },
    { header: 'Date', accessor: 'billDate' },
    { header: 'Client Name', accessor: 'clientName' },
    { header: 'Account No', accessor: 'accountNo' },
    { header: 'Tag', accessor: 'tagNo' },
    { header: 'Weight', accessor: 'weight' },
    { header: 'Rate', accessor: 'amount' },
    { header: 'Making', accessor: 'making' },
    { header: 'Total', accessor: 'finalBalance' },
    { header: 'Mobile', accessor: 'mobile' },
  ]

  // 🔹 Dummy Data (Replace with API later)
  const data = [
    {
      billDate: '2024-01-10',
      clientName: 'Rahul Sharma',
      accountNo: 'A001',
      tagNo: 'T101',
      weight: 10,
      amount: 50000,
      making: 2000,
      finalBalance: 52000,
      mobile: '9876543210',
    },
    {
      billDate: '2024-01-12',
      clientName: 'Priya Verma',
      accountNo: 'A002',
      tagNo: 'T102',
      weight: 8,
      amount: 40000,
      making: 1500,
      finalBalance: 41500,
      mobile: '9876543200',
    },
  ]

  return (
    <>
      <BreadcrumbNav />
      <CardSection />

      <div className="p-6">
        <h2 className="mb-6 text-3xl font-bold text-yellow-400">
          Tag Wise Report
        </h2>

        {/* 🔹 Filter Section */}
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
              text="Print"
              className="w-full"
              onClick={() => window.print()}
            />
          </div>
        </div>

        {/* 🔹 Table */}
        <div className="overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl">
          <DynamicTable columns={columns} data={data} />
        </div>
      </div>
    </>
  )
}

export default TagwiseReport