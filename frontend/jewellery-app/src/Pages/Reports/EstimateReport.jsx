import React, { useState, useEffect } from 'react'
import CardSection from '../Home/CardSection'
import DynamicForm from '../../Components/Form/DynamicForm'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:5000/api/estimateReport'

const EstimateReport = () => {
    const [formValues, setFormValues] = useState({ dateFrom: '' })
    const [reportData, setReportData] = useState([])
    const [summary, setSummary] = useState({ totalRecord: 0, totalCash: 0 })
    const [loading, setLoading] = useState(false)

    // =========================
    // FETCH DATA (Default = Today)
    // =========================
    const fetchReportData = async () => {
        setLoading(true)
        try {
            const res = await fetch(API_BASE) 
            const data = await res.json()

            if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch')

            setReportData(data.data || [])
            setSummary(data.summary || { totalRecord: 0, totalCash: 0 })
        } catch (err) {
            console.error(err)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReportData()
    }, [])

    // =========================
    // SEARCH HANDLER
    // =========================
    const handleSearch = async () => {
        if (!formValues.dateFrom) {
            toast.warning("Please select a date to search")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/search?dateFrom=${formValues.dateFrom}`)
            const data = await res.json()

            if (!res.ok || !data.success) throw new Error(data.message || 'Search failed')

            setReportData(data.data || [])
            setSummary(data.summary || { totalRecord: 0, totalCash: 0 })
            toast.success(`Data loaded for ${formValues.dateFrom}`)
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

    const handlePrint = () => {
        toast.success('Opening print window...')
    }

    const fields = [
        {
            key: 'dateFrom',
            label: 'Date From',
            type: 'date',
            className: 'col-12 col-md-12',
        },
    ]

    // =========================
    // CALCULATE TOTALS
    // =========================
    const totals = reportData.reduce(
        (acc, row) => {
            acc.saleAmt += Number(row.totalFinal || 0) + Number(row.income || 0);
            acc.denaAmt += Number(row.additionAll || 0) + Number(row.expense || 0);
            acc.aaiAmt += Number(row.pay || 0);
            acc.gayiBal += Number(row.balance || 0);
            return acc;
        },
        { saleAmt: 0, denaAmt: 0, aaiAmt: 0, gayiBal: 0 }
    );

    // =========================
    // ✅ 100% SAFE RENDER FUNCTION
    // =========================
    const safeRender = (val) => {
        if (val === null || val === undefined || val === '') return 'N/A';
        if (typeof val === 'object') {
            if (val instanceof Date) {
                return val.toLocaleDateString('en-GB'); // DD/MM/YYYY
            }
            return JSON.stringify(val); // Agar koi aur object ho
        }
        return String(val); // Number ya String ko string banao
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
                            <h2 className="h4 fw-bold mb-0 text-warning">Estimate Report</h2>
                            <p className="small text-secondary mb-0">View comprehensive estimates and transactions</p>
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
                </div>

                {/* SUMMARY BAR */}
                <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                    <div className="text-light">
                        <span className="fw-bold text-warning">Total Record:</span> {safeRender(summary.totalRecord)}
                    </div>
                    <div className="text-light">
                        <span className="fw-bold text-warning">Total Cash:</span> ₹
                        {safeRender(summary.totalCash)} &nbsp;|&nbsp;
                        <span className="fw-bold text-warning">Date:</span> {formValues.dateFrom || 'Today'}
                    </div>
                </div>

                {/* ============ CUSTOM TABLE WITH FOOTER ============ */}
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
                            <div className="text-secondary mt-2">No records found</div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(250, 204, 21, 0.15)', borderBottom: '1px solid rgba(250, 204, 21, 0.3)' }}>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '15%' }}>बिक्री [A]</th>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '10%' }}>बिक्री (Amt)</th>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '15%' }}>देना [B]</th>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '10%' }}>देना (Amt)</th>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '15%' }}>आई [C]</th>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '10%' }}>आई (Amt)</th>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '15%' }}>गई [D]</th>
                                        <th className="text-center text-warning py-3" style={{ fontSize: '0.85rem', fontWeight: 700, width: '10%' }}>गई (Bal)</th>
                                    </tr>
                                </thead>
                                
                                <tbody>
                                    {reportData.map((row, index) => {
                                        const displayName = (Number(row.income) > 0 || Number(row.expense) > 0)
                                            ? (row.remark || 'Expense')
                                            : (row.customerName || 'N/A');
                                        
                                        const बिक्री = Number(row.totalFinal || 0) + Number(row.income || 0);
                                        const देना = Number(row.additionAll || 0) + Number(row.expense || 0);
                                        const आई = Number(row.pay || 0);
                                        const गई = Number(row.balance || 0);

                                        return (
                                            <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                {/* Column A */}
                                                <td className="text-start p-3" style={{ fontSize: '0.9rem' }}>
                                                    <div className="fw-bold text-warning">{safeRender(row.accountNo)}</div>
                                                    <div>{safeRender(displayName)}</div>
                                                    <div className="small text-secondary">
                                                        {safeRender(row.billDate)}
                                                    </div>
                                                </td>
                                                <td className="text-end p-3 fw-bold" style={{ fontSize: '0.9rem' }}>
                                                    {बिक्री.toFixed(2)}
                                                </td>
                                                
                                                {/* Column B */}
                                                <td className="text-start p-3" style={{ fontSize: '0.9rem' }}>
                                                    <div className="fw-bold text-warning">{safeRender(row.accountNo)}</div>
                                                    <div className="small text-secondary">
                                                        {safeRender(row.customerName)} 
                                                        {row.textSwapOnline ? ` : ${safeRender(row.textSwapOnline)}` : ''} 
                                                        {row.oldGold > 0 ? ` : Gold ${safeRender(row.oldGold)}` : ''}
                                                    </div>
                                                </td>
                                                <td className="text-end p-3 fw-bold" style={{ fontSize: '0.9rem' }}>
                                                    ₹{देना.toFixed(2)}
                                                </td>
                                                
                                                {/* Column C */}
                                                <td className="text-start p-3" style={{ fontSize: '0.9rem' }}>
                                                    <div className="fw-bold text-warning">{safeRender(row.accountNo)}</div>
                                                    <div className="small text-secondary">
                                                        {safeRender(row.customerName)} 
                                                        {row.pay > 0 ? ` - ₹${safeRender(row.pay)}` : ''}
                                                    </div>
                                                </td>
                                                <td className="text-end p-3 fw-bold" style={{ fontSize: '0.9rem' }}>
                                                    ₹{आई.toFixed(2)}
                                                </td>
                                                
                                                {/* Column D */}
                                                <td className="text-start p-3" style={{ fontSize: '0.9rem' }}>
                                                    <div className="fw-bold text-warning">{safeRender(row.accountNo)}</div>
                                                    <div>{safeRender(row.customerName)}</div>
                                                </td>
                                                <td className="text-end p-3 fw-bold text-danger" style={{ fontSize: '0.9rem' }}>
                                                    ₹{गई.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                {/* Footer Totals */}
                                <tfoot>
                                    <tr style={{ background: 'rgba(250, 204, 21, 0.1)', borderTop: '2px solid rgba(250, 204, 21, 0.4)' }}>
                                        <td className="text-end p-3"></td>
                                        <td className="text-end text-warning fw-bold p-3">{totals.saleAmt.toFixed(2)}</td>
                                        
                                        <td className="text-end p-3"></td>
                                        <td className="text-end text-warning fw-bold p-3">₹{totals.denaAmt.toFixed(2)}</td>
                                        
                                        <td className="text-end p-3"></td>
                                        <td className="text-end text-warning fw-bold p-3">₹{totals.aaiAmt.toFixed(2)}</td>
                                        
                                        <td className="text-end p-3"></td>
                                        <td className="text-end text-warning fw-bold p-3">₹{totals.gayiBal.toFixed(2)}</td>
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

export default EstimateReport