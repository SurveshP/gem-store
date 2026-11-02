import React, { useEffect, useState } from "react";
import DynamicForm from '../../Components/Form/DynamicForm'
import DynamicTable from '../../Components/Tables/DynamicTable'
import Button from '../../Components/Bottons/Button'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'
import CardSection from '../Home/CardSection'
import { useNavigate } from 'react-router-dom'
import BillingPopup from "./BillingPopup";
import { toast } from "react-toastify"; //Toastify import kiya

const BillingDetails = () => {
    const [formValues, setFormValues] = useState({})
    const [billingData, setBillingData] = useState([]);
    const [isBillingPopupOpen, setIsBillingPopupOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        getBilling();
    }, []);

    const onChange = (key, value) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    // 🔹 Popup functions
    const openBill = (id) => {
        const w = 1200;
        const h = 700;
        const left = window.screen.width / 2 - w / 2;
        const top = window.screen.height / 2.2 - h / 2;

        window.open(
            `/billPrint/${id}`,
            "Popup",
            `width=${w},height=${h},top=${top},left=${left}`
        );
    };

    const openEstimate = () => {
        const w = 1200
        const h = 600
        const left = window.screen.width / 2 - w / 2
        const top = window.screen.height / 2.2 - h / 2

        window.open('/EstimatePrint', 'Popup',
            `width=${w},height=${h},top=${top},left=${left}`)
    }

    // 🔹 Dynamic Form Fields
    const fields = [
        {
            key: 'search',
            label: 'Search (Ac No, Bill No, Name)',
            type: 'text',
        },
    ]

    // 🔹 Table Columns
    const columns = [
        { header: 'SN', render: (_, index) => index + 1 },
        { header: 'TYPE', accessor: 'billType' },
        { header: 'BILL', accessor: 'billNo' },
        { header: 'ACNO', accessor: 'accountNo' },
        { header: 'DATE', accessor: 'billDate' },
        { header: 'DUE DATE', accessor: 'dueDate' },
        { header: 'CLIENT NAME', accessor: 'customerName' },
        { header: 'AMOUNT', accessor: 'finalAmount' },
        { header: 'CGST', accessor: 'cgst' },
        { header: 'SGST', accessor: 'sgst' },
        { header: 'ROUND', accessor: 'roundAmount' },
        { header: 'TOTAL', accessor: 'finalTotal' },
        { header: 'PAID', accessor: 'paid' },
        { header: 'BAL', accessor: 'balance' },
        {
            header: 'ACTION',
            render: (row) => (
                <div className="d-flex justify-content-center gap-3">
                    <button
                        onClick={() => openBill(row.id)}
                        className="btn btn-link p-0 text-primary"
                        style={{ textDecoration: 'none', fontSize: '1.1rem' }}
                    >
                        🖨️
                    </button>
                    <button
                        onClick={() => deleteBilling(row.id)}
                        className="btn btn-link p-0 text-danger"
                        style={{ textDecoration: 'none', fontSize: '1.1rem' }}
                    >
                        🗑️
                    </button>
                </div>
            ),
        }
    ]

    // ================= FETCH BILLING (ALL / SEARCH) =================
    const getBilling = async (searchQuery = '') => {
        try {
            //Agar search text hai to /search/data pe jayega, warna /all
            const url = searchQuery.trim()
                ? `http://localhost:5000/api/billing/search/data?search=${encodeURIComponent(searchQuery.trim())}`
                : `http://localhost:5000/api/billing/all`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setBillingData(data.data);
            } else {
                toast.error(data.message || "Failed to fetch data");
            }
        } catch (err) {
            console.log(err);
            toast.error("Server Error");
        }
    };

    //Search Handler
    const handleSearch = () => {
        getBilling(formValues.search || '');
    }

    //Clear Search
    const handleClearSearch = () => {
        setFormValues((prev) => ({ ...prev, search: '' }));
        getBilling('');
    }

    // ================= DELETE BILLING =================
    const deleteBilling = async (id) => {
        if (!window.confirm("Delete this bill ?")) return;
        
        const toastId = toast.loading("Deleting...");
        try {
            const res = await fetch(`http://localhost:5000/api/billing/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            
            if (data.success) {
                toast.update(toastId, {
                    render: data.message,
                    type: 'success',
                    isLoading: false,
                    autoClose: 2500,
                });
                getBilling(formValues.search || '');
            } else {
                toast.update(toastId, {
                    render: data.message || 'Delete failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (err) {
            console.log(err);
            toast.update(toastId, {
                render: 'Server Error',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        }
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
                            <h2 className="h4 fw-bold mb-0 text-warning">Billing Details</h2>
                            <p className="small text-secondary mb-0">
                                Manage all your billing records here
                            </p>
                        </div>
                    </div>

                    <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                            background: 'rgba(250, 204, 21, 0.12)',
                            color: '#facc15',
                            fontSize: '0.8rem',
                        }}
                    >
                        {billingData.length} Records
                    </span>
                </div>

                {/* FILTER SECTION */}
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
                            <DynamicForm
                                fields={fields}
                                formValues={formValues}
                                onChange={onChange}
                            />
                        </div>

                        <div className="col-6 col-md-2">
                            {/*Search Button Updated */}
                            <Button text="Search" className="w-100" onClick={handleSearch} />
                        </div>

                        <div className="col-6 col-md-2">
                            <Button
                                text="New Record"
                                className="w-100"
                                onClick={() => setIsBillingPopupOpen(true)}
                            />
                        </div>
                    </div>

                    {formValues.search && (
                        <div className="mt-3">
                            <span
                                role="button"
                                onClick={handleClearSearch}
                                style={{
                                    fontSize: '0.8rem',
                                    color: '#facc15',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                }}
                            >
                                Clear search
                            </span>
                        </div>
                    )}
                </div>

                {/* TABLE */}
                <div
                    className="rounded-3 overflow-hidden"
                    style={{
                        background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
                        border: '1px solid rgba(250, 204, 21, 0.15)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    <DynamicTable columns={columns} data={billingData} />
                </div>

                <BillingPopup
                    isOpen={isBillingPopupOpen}
                    onClose={() => {
                        setIsBillingPopupOpen(false);
                        getBilling(); //Naya bill save hone ke baad data refresh hoga
                    }}
                    title="Billing Cash / Credit"
                />
            </div>
        </>
    )
}

export default BillingDetails