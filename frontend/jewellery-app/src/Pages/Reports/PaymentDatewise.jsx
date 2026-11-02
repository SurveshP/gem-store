import React, { useState } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/estimateReport'

const PaymentDatewise = () => {
    const [formValues, setFormValues] = useState({ dateFrom: '', dateTo: '' })
    const [reportData, setReportData] = useState([])
    const [summary, setSummary] = useState({ totalRecord: 0, totalCash: 0 })
    const [loading, setLoading] = useState(false)

    // =========================
    // FETCH DATA (Date Range)
    // =========================
    const fetchReportData = async () => {
        if (!formValues.dateFrom || !formValues.dateTo) {
            toast.warning("Please select both Date From and Date To")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/payment-datewise?dateFrom=${formValues.dateFrom}&dateTo=${formValues.dateTo}`)
            const data = await res.json()

            if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch')

            setReportData(data.data || [])
            setSummary(data.summary || { totalRecord: 0, totalCash: 0 })
        } catch (err) {
            console.error(err)
            toast.error(err.message)
            setReportData([])
            setSummary({ totalRecord: 0, totalCash: 0 })
        } finally {
            setLoading(false)
        }
    }

    const onChange = (key, value) => {
        setFormValues((prev) => ({ ...prev, [key]: value }))
    }

    const handleSearch = () => {
        fetchReportData()
    }

    const handleClear = () => {
        setFormValues({ dateFrom: '', dateTo: '' })
        setReportData([])
        setSummary({ totalRecord: 0, totalCash: 0 })
    }

    const handlePrint = () => {
        toast.success('Opening print window...')
    }

    const fields = [
        {
            key: 'dateFrom',
            label: 'Date From *',
            type: 'date',
            className: 'col-12 col-md-6',
        },
        {
            key: 'dateTo',
            label: 'Date To *',
            type: 'date',
            className: 'col-12 col-md-6',
        },
    ]

    // =========================
    // CALCULATE TOTALS
    // =========================
    const totalPayment = reportData.reduce(
        (sum, row) => sum + Number(row.pay || 0),
        0
    );

    // =========================
    // SAFE RENDER FUNCTION
    // =========================
    const safeRender = (val) => {
        if (val === null || val === undefined || val === '') return 'N/A';
        if (typeof val === 'object') {
            if (val instanceof Date) {
                return val.toLocaleDateString('en-GB');
            }
            return JSON.stringify(val);
        }
        return String(val);
    };

    return (
        <>
            <BreadcrumbNav />
            <CardSection />

            <div className="container-fluid px-3 px-sm-4 px-lg-5 py-4">
                {/* PAGE HEADER */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                    <div className="d-flex align-items-center">
                        <span
                            style={{
                                display: 'inline-block',
                                width: 4,
                                height: 26,
                                background: '#facc15',
                                borderRadius: 4,
                                marginRight: 12,
                            }}
                        ></span>
                        <div>
                            <h2 className="h4 fw-bold mb-0 text-warning">Payment Datewise Report</h2>
                            <p className="small text-secondary mb-0">View all collected payments by date range</p>
                        </div>
                    </div>
                </div>

                {/* FILTER PANEL */}
                <div
                    className="rounded-3 p-3 p-sm-4 mb-4"
                    style={{
                        background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
                        border: '1px solid rgba(250, 204, 21, 0.15)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-8">
                            <DynamicForm fields={fields} formValues={formValues} onChange={onChange} />
                        </div>
                        <div className="col-6 col-md-2">
                            <Button text="Search!" className="w-100" onClick={handleSearch} />
                        </div>
                        <div className="col-6 col-md-2">
                            <Button text="Print" className="w-100" onClick={handlePrint} />
                        </div>
                    </div>
                    {reportData.length > 0 && (
                        <div className="mt-3 text-end">
                            <span role="button" onClick={handleClear} style={{ fontSize: '0.8rem', color: '#facc15', cursor: 'pointer', textDecoration: 'underline' }}>
                                Clear Search
                            </span>
                        </div>
                    )}
                </div>

                {/* SUMMARY BAR */}
                <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                    <div className="text-light">
                        <span className="fw-bold text-warning">Total Record:</span> {safeRender(summary.totalRecord)}
                    </div>
                    <div className="text-light">
                        <span className="fw-bold text-warning">Total Collected:</span> ₹
                        {safeRender(summary.totalCash)} &nbsp;|&nbsp;
                        <span className="fw-bold text-warning">Date:</span> {formValues.dateFrom || '-'} to {formValues.dateTo || '-'}
                    </div>
                </div>

                {/* ============ CUSTOM TABLE WITH FOOTER (4 COLUMNS) ============ */}
                <div
                    className="rounded-3 overflow-hidden"
                    style={{
                        background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
                        border: '1px solid rgba(250, 204, 21, 0.15)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-warning mb-2" role="status" />
                        </div>
                    ) : reportData.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '2.5rem' }}>💎</div>
                            <div className="text-secondary mt-2">No payments found for this date range</div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(250, 204, 21, 0.15)', borderBottom: '1px solid rgba(250, 204, 21, 0.3)' }}>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '10%' }}>Sno.</th>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '20%' }}>Date</th>
                                        <th className="text-start text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '50%' }}>Description</th>
                                        <th className="text-end text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '20%' }}>Payment</th>
                                    </tr>
                                </thead>
                                
                                <tbody>
                                    {reportData.map((row, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            {/* Sno. */}
                                            <td className="text-center p-3" style={{ fontSize: '0.9rem' }}>
                                                {index + 1}
                                            </td>
                                            
                                            {/* Date */}
                                            <td className="text-center p-3" style={{ fontSize: '0.9rem' }}>
                                                {safeRender(row.billDate)}
                                            </td>

                                            {/* Description */}
                                            <td className="text-start p-3" style={{ fontSize: '0.9rem' }}>
                                                <div className="fw-bold text-warning">{safeRender(row.accountNo)}</div>
                                                <div>{safeRender(row.customerName)}</div>
                                                {row.billNo && (
                                                    <div className="small text-secondary mt-1">Ref: {safeRender(row.billNo)}</div>
                                                )}
                                            </td>

                                            {/* Payment */}
                                            <td className="text-end p-3 fw-bold text-success" style={{ fontSize: '1rem' }}>
                                                ₹{Number(row.pay || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                                {/* Footer Totals */}
                                <tfoot>
                                    <tr style={{ background: 'rgba(250, 204, 21, 0.1)', borderTop: '2px solid rgba(250, 204, 21, 0.4)' }}>
                                        <td className="text-end p-3 text-warning fw-bold" colSpan={3}>
                                            Grand Total:
                                        </td>
                                        <td className="text-end text-success fw-bold p-3 fs-5">
                                            ₹{totalPayment.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default PaymentDatewise