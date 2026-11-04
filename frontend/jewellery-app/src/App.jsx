import React, { useState, useEffect } from 'react'
import Navbar from './Layouts/Header/Navbar'
import Home from './Pages/Home/Home'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './Pages/Home/Dashboard'
import CustomerDetails from './Pages/Customer/CustomerDetails'
import ItemsDetails from './Pages/Items/ItemsDetails'
import StockInDetails from './Pages/Stock/StockInDetails'
import BillingDetails from './Pages/Bill/BillingDetails'
import BillPrint from './Pages/Bill/BillPrint'

// 🔔 Toastify
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CreditListDetails from './Pages/CreditList/CreditListDetails'
import ExpensesDetails from './Pages/IncomeExpenses/ExpensesDetails'
import EstimateReport from './Pages/Reports/EstimateReport'
import StockInOutRegister from './Pages/Stock/StockInOutRegister'
import StockRegister from './Pages/Stock/StockRegister'
import StockOutRegisterGold from './Pages/Stock/StockOutRegisterGold'
import StockOutRegisterSilver from './Pages/Stock/StockOutRegisterSilver'
import CreditListDatewise from './Pages/CreditList/CreditListDatewise'
import PaymentDatewise from './Pages/Reports/PaymentDatewise'
import CreditBalanceDatewise from './Pages/Reports/CreditBalanceDatewise'
import BillingReports from './Pages/Bill/BillingReports'
import TagwiseReport from './Pages/Bill/TagwiseReport'
import CreditList25K from './Pages/CreditList/CreditList25K'
import CreditListZeroBalance from './Pages/CreditList/CreditListZeroBalance'
import CaratwiseReport from './Pages/Stock/CaratwiseReport'

// 👈 NAYA: Login Page import karein
// import Login from './Pages/Auth/Login' 
import Login from './Pages/Login/Login'

// 👇 Naya wrapper component
const AppContent = () => {
  const location = useLocation()

  // 👈 NAYA: Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Page load hone par check karo ki user logged in hai ya nahi
  useEffect(() => {
    const auth = localStorage.getItem('isLoggedIn')
    if (auth === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  // Print page pe navbar/footer hide karo
  const isPrintPage = location.pathname.startsWith('/billPrint')
  const isLoginPage = location.pathname.startsWith('/login')

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: '#09090b', color: '#f4f4f5' }}
    >
      {/* Navbar — print page aur login page ko chhod kar sab jagah dikhega */}
      {!isPrintPage && !isLoginPage && (
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}

      <main className="flex-grow-1">
        <Routes>
          {/* ✅ LOGIN ROUTE */}
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Login setIsLoggedIn={setIsLoggedIn} />
            }
          />

          {/* ✅ PROTECTED ROUTES (Login zaroori hai) */}
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/customerDetails" element={isLoggedIn ? <CustomerDetails /> : <Navigate to="/login" />} />

          <Route path="/itemPage" element={isLoggedIn ? <ItemsDetails /> : <Navigate to="/login" />} />

          <Route path="/stockInDetails" element={isLoggedIn ? <StockInDetails /> : <Navigate to="/login" />} />
          <Route path="/stockInOutRegister" element={isLoggedIn ? <StockInOutRegister /> : <Navigate to="/login" />} />
          <Route path="/stockRegister" element={isLoggedIn ? <StockRegister /> : <Navigate to="/login" />} />
          <Route path="/stockOutRegisterGold" element={isLoggedIn ? <StockOutRegisterGold /> : <Navigate to="/login" />} />
          <Route path="/stockOutRegisterSilver" element={isLoggedIn ? <StockOutRegisterSilver /> : <Navigate to="/login" />} />
          <Route path="/caratwiseReport" element={isLoggedIn ? <CaratwiseReport /> : <Navigate to="/login" />} />

          <Route path="/creditList" element={isLoggedIn ? <CreditListDetails /> : <Navigate to="/login" />} />
          <Route path="/creditListDatewise" element={isLoggedIn ? <CreditListDatewise /> : <Navigate to="/login" />} />
          <Route path="/creditList25K" element={isLoggedIn ? <CreditList25K /> : <Navigate to="/login" />} />
          <Route path="/creditListZeroBalance" element={isLoggedIn ? <CreditListZeroBalance /> : <Navigate to="/login" />} />

          <Route path="/billing" element={isLoggedIn ? <BillingDetails /> : <Navigate to="/login" />} />
          {/* BillPrint public hai taaki print hamesha khul sake */}
          <Route path="/billPrint/:id" element={<BillPrint />} />

          <Route path="/billingReports" element={isLoggedIn ? <BillingReports /> : <Navigate to="/login" />} />
          <Route path="/tagwiseReport" element={isLoggedIn ? <TagwiseReport /> : <Navigate to="/login" />} />

          <Route path="/income-expenses" element={isLoggedIn ? <ExpensesDetails /> : <Navigate to="/login" />} />

          <Route path="/estimateReport" element={isLoggedIn ? <EstimateReport /> : <Navigate to="/login" />} />
          <Route path="/paymentDatewise" element={isLoggedIn ? <PaymentDatewise /> : <Navigate to="/login" />} />
          <Route path="/creditBalanceDatewise" element={isLoggedIn ? <CreditBalanceDatewise /> : <Navigate to="/login" />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer — sirf non-print aur non-login pages pe */}
      {!isPrintPage && !isLoginPage && (
        <footer
          className="text-center py-3"
          style={{
            borderTop: '1px solid rgba(250, 204, 21, 0.2)',
            color: '#71717a',
            fontSize: '0.8rem',
          }}
        >
          © {new Date().getFullYear()} GemStore — All rights reserved.
        </footer>
      )}

      {/* Toast Container — hamesha */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App