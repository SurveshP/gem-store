import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BillPrint.css';

const BillPrint = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [billData, setBillData] = useState(null);
    const [itemsData, setItemsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const date = new Date();
        const time =
            date.getHours() +
            ':' +
            String(date.getMinutes()).padStart(2, '0') +
            ':' +
            String(date.getSeconds()).padStart(2, '0');
        setCurrentTime(time);
        if (id) fetchBillData(id);
    }, [id]);

    const fetchBillData = async (billId) => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Fetch Billing
            const billingUrl = `http://localhost:5000/api/billing/${billId}`;
            const response = await fetch(billingUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch bill');
            if (!data.data) throw new Error('No bill data found');

            const bill = data.data;

            // ✅ Fetch Items by billNo
            const itemsUrl = `http://localhost:5000/api/itemsBilling/by-bill/${encodeURIComponent(bill.billNo)}`;
            const itemsResponse = await fetch(itemsUrl);
            const itemsJson = await itemsResponse.json();

            setBillData(bill);
            setItemsData(itemsJson.success ? itemsJson.data : []);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error fetching bill data');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();
    const handleBack = () => navigate(-1);

    const formatCurrency = (amount) => {
        if (!amount) return '0.00';
        return Number(amount).toFixed(2);
    };

    if (loading) {
        return (
            <div className="bill-load">
                <div className="text-center">
                    <div className="spin"></div>
                    <p className="txt">Loading Bill Details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bill-err">
                <div className="bill-err-box">
                    <h4>❌ Error!</h4>
                    <p>{error}</p>
                    <button onClick={handleBack}>Go Back</button>
                </div>
            </div>
        );
    }

    if (!billData) {
        return (
            <div className="bill-err">
                <div className="bill-err-box" style={{ borderColor: '#eab308' }}>
                    <h4 style={{ color: '#eab308' }}>⚠️ No Data Found</h4>
                    <p style={{ color: '#fcd34d' }}>Bill ID: {id}</p>
                    <button onClick={handleBack}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bill-btns">
                <button className="print" onClick={handlePrint}>
                    🖨️ Print
                </button>
            </div>

            <div className="bill-wrapper">
                <div className="bill-container">
                    <div className="bill-content">
                        {/* ============ HEADER ============ */}
                        <div className="bill-header">
                            <div className="bill-om">
                                <span className="left">|| ॐ ||</span>
                                <span className="center">|| ओम शिवोहम ||</span>
                                <span className="right">|| ॐ ||</span>
                            </div>
                            <h1 className="bill-name">Om Shivam Jewellers</h1>
                            <p className="bill-addr">
                                Shop No. 4, Durga Chouk, Samanvya Nagar, Awadhpuri, BHEL, Bhopal(M.P.)
                            </p>
                            <p className="bill-contact">
                                📞 Mob. : 9826411487 &nbsp;|&nbsp; GSTIN – 23BBYPK4634G2ZD
                            </p>
                        </div>

                        {/* ============ BILL INFO ============ */}
                        <div className="bill-grid">
                            <div className="bill-box">
                                <span className="lbl">Bill No:</span>
                                <span className="gold">{billData.billNo || 'N/A'}</span>
                            </div>
                            <div className="bill-box tc">
                                <span className="lbl">Date:</span>
                                <span className="val">{billData.billDate || 'N/A'}</span>
                                <span className="lbl"> | </span>
                                <span className="val">{currentTime}</span>
                            </div>
                            <div className="bill-box tr">
                                <span className="lbl">HSN:</span>
                                <span className="val">G-7113 S-7114</span>
                            </div>
                        </div>

                        {/* ============ CUSTOMER INFO ============ */}
                        <div className="bill-cust">
                            <div className="bill-cust-grid">
                                <div>
                                    <span className="lbl">Customer:</span>{' '}
                                    <span className="val">{billData.customerName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="lbl">Account:</span>{' '}
                                    <span className="val">{billData.accountNo || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="lbl">Address:</span>{' '}
                                    <span className="val">{billData.address || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="lbl">Mobile:</span>{' '}
                                    <span className="val">{billData.mobile || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* ============ ITEMS TABLE ============ */}
                        <div className="bill-table-wrap">
                            <table className="bill-table">
                                <thead>
                                    <tr>
                                        <th className="sn">#</th>
                                        <th className="left">ITEM DESCRIPTION</th>
                                        <th className="wt">WEIGHT</th>
                                        <th className="rt">RATE</th>
                                        <th className="tt">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsData && itemsData.length > 0 ? (
                                        itemsData.map((item, index) => (
                                            <tr key={item.id || index}>
                                                <td className="sn">{index + 1}</td>
                                                <td>
                                                    <span className="item">
                                                        {item.type || item.itemName || ''}
                                                    </span>
                                                    <span className="desc">
                                                        {item.itemDesc || ''}
                                                        {item.makingCharge
                                                            ? `, Making: ${item.makingCharge}`
                                                            : ''}
                                                        {item.tagNo ? `, Tag: ${item.tagNo}` : ''}
                                                        {item.metalType ? `, ${item.metalType}` : ''}
                                                    </span>
                                                </td>
                                                <td className="wt">{item.weight || '0'}</td>
                                                <td className="rt">₹{item.amount || '0'}</td>
                                                <td className="tt">
                                                    ₹{item.totalAmount || item.total || '0'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="empty">
                                                No items found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ============ TOTALS ============ */}
                        <div className="bill-totals">
                            <div className="bill-words">
                                <span className="lbl">In Words:</span>
                                <span className="val">
                                    {billData.finalTotal
                                        ? `${billData.finalTotal} Only`
                                        : 'Zero'}
                                </span>
                            </div>
                            <div className="bill-summary">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className="lbl">CGST</td>
                                            <td className="val">
                                                ₹{formatCurrency(billData.cgst || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="lbl">SGST</td>
                                            <td className="val">
                                                ₹{formatCurrency(billData.sgst || 0)}
                                            </td>
                                        </tr>
                                        <tr className="row-total">
                                            <td className="lbl">Total</td>
                                            <td className="gold">
                                                ₹{formatCurrency(billData.finalTotal || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="lbl">Cash</td>
                                            <td className="val">
                                                ₹{formatCurrency(billData.cash || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="lbl">Online</td>
                                            <td className="val">
                                                ₹{formatCurrency(billData.online || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="lbl">Old Gold</td>
                                            <td className="val">
                                                ₹{formatCurrency(billData.oldGold || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="lbl">Discount</td>
                                            <td className="val">
                                                ₹{formatCurrency(billData.roundAmount || 0)}
                                            </td>
                                        </tr>
                                        <tr className="row-balance">
                                            <td className="lbl">Balance</td>
                                            <td className="gold">
                                                ₹{formatCurrency(billData.balance || 0)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ============ TERMS ============ */}
                        <div className="bill-terms">
                            <p className="title">TERMS & CONDITIONS</p>
                            <ol>
                                <li>
                                    विक्रय आभूषण का निर्माण सोने के साथ चांदी व तांबे के मिश्रण
                                    से हुआ है
                                </li>
                                <li>
                                    जिस दिन क्रेता आभूषण विक्रय करेगा उस दिन के भाव से
                                    सोना/चांदी {billData.remarks || ''}% में बदला जावेगा
                                </li>
                                <li>
                                    आभूषण विक्रय उपरांत टूट-फूट की जवाबदारी विक्रेता की नहीं
                                    होगी
                                </li>
                            </ol>
                        </div>

                        {/* ============ FOOTER ============ */}
                        <div className="bill-footer">
                            <div className="sales">
                                <span>Sales:</span> {billData.salesBy || 'Admin'}
                            </div>
                            <p className="thanks">✨ Thank You ✨</p>
                            <div className="pay">
                                <span>Payment:</span>{' '}
                                {billData.paymentRemarks || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BillPrint;