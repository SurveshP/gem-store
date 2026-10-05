import React from 'react'
import Navbar from './Layouts/Header/Navbar'
import Home from './Pages/Home/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Pages/Home/Dashboard'
import CustomerDetails from './Pages/Customer/CustomerDetails'

// 🔔 Toastify
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <BrowserRouter>
      <div
        className="d-flex flex-column min-vh-100"
        style={{ background: '#09090b', color: '#f4f4f5' }}
      >
        <Navbar />

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customerDetails" element={<CustomerDetails />} />
          </Routes>
        </main>

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

        {/* 🔔 Toast Container */}
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
    </BrowserRouter>
  )
}

export default App