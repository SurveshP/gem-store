import React from 'react'
import CardSection from './CardSection'
import Charts from './Charts'
import img1 from '../../assets/Images/home-image.jpg'
import BreadcrumbNav from '../../Layouts/Header/BreadcrumbNav'

const Dashboard = () => {
  return (
    <>
      <BreadcrumbNav />

      <div className="container-fluid px-3 px-sm-4 px-lg-5 py-4">

        {/* ============ HERO BANNER ============ */}
        <div className="position-relative rounded-4 overflow-hidden shadow-lg mb-4">
          <img
            src={img1}
            alt="Dashboard"
            className="w-100 d-block"
            style={{ height: '220px', objectFit: 'cover' }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(250,204,21,0.25) 100%)',
            }}
          ></div>

          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center px-3">
            <h1
              className="fw-bold mb-2"
              style={{
                color: '#facc15',
                fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
                textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              }}
            >
              Dashboard Overview
            </h1>
            <p
              className="mb-0 text-light"
              style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1rem)', opacity: 0.85 }}
            >
              Welcome to your Jewellery Management System
            </p>
          </div>
        </div>

        {/* ============ SECTION HEADER ============ */}
        <div className="d-flex align-items-center mb-2">
          <span
            style={{
              display: 'inline-block',
              width: 4,
              height: 22,
              background: '#facc15',
              borderRadius: 4,
              marginRight: 10,
            }}
          ></span>
          <h2 className="h5 fw-bold mb-0 text-warning">Quick Actions</h2>
        </div>
        <p className="text-secondary small mb-3">
          Jump to frequently used modules
        </p>

      </div>

      {/* Cards */}
      <CardSection />

      {/* Charts */}
      <Charts />
    </>
  )
}

export default Dashboard