import React from 'react'
import Navbar from './Layouts/Header/Navbar'
import Home from './Pages/Home/Home'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Dashboard from './Pages/Home/Dashboard'
import CustomerDetails from './Pages/Customer/CustomerDetails'
import ItemsDetails from './Pages/Items/ItemsDetails'
import StockInDetails from './Pages/Stock/StockInDetails'
import BillingDetails from './Pages/Bill/BillingDetails'
import BillPrint from './Pages/Bill/BillPrint'

// 🔔 Toastify
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// 👇 Naya wrapper component (kyunki useLocation Router ke andar hona chahiye)
const AppContent = () => {
  const location = useLocation()

  // Print page pe navbar/footer hide karo
  const isPrintPage = location.pathname.startsWith('/billPrint')

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: '#09090b', color: '#f4f4f5' }}
    >
      {/* Navbar — sirf non-print pages pe */}
      {!isPrintPage && <Navbar />}

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customerDetails" element={<CustomerDetails />} />
          <Route path="/itemPage" element={<ItemsDetails />} />
          <Route path="/stockInDetails" element={<StockInDetails />} />
          <Route path="/billing" element={<BillingDetails />} />
          <Route path="/billPrint/:id" element={<BillPrint />} />
        </Routes>
      </main>

      {/* Footer — sirf non-print pages pe */}
      {!isPrintPage && (
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