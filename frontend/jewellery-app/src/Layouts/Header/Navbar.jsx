import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaChevronDown, FaGem } from 'react-icons/fa'
import Button from '../../Components/Bottons/Button'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)       // mobile menu
  const [openDropdown, setOpenDropdown] = useState(null) // mobile accordion
  const location = useLocation()
  const navRef = useRef(null)

  // Route change hone par menu band
  useEffect(() => {
    setIsOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  // Bahar click par mobile menu band
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mobile menu open hone par body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const menuItems = [
    {
      label: 'Master',
      links: [{ to: '/itemPage', label: 'Items' }],
    },
    {
      label: 'Stock & Inventory',
      links: [
        { to: '/stockInDetails', label: 'Stock In' },
        { to: '/stockRegister', label: 'Stock Register' },
        { to: '/stockInRegister', label: 'Stock In Register' },
        { to: '/stockOutRegisterGold', label: 'Stock Out Register Gold' },
        { to: '/stockOutRegisterSilver', label: 'Stock Out Register Silver' },
        { divider: true },
        { to: '/estimateReport', label: 'Estimate Report' },
      ],
    },
    {
      label: 'Report',
      links: [
        { to: '/creditlistDatewise', label: 'Creditlist Datewise' },
        { to: '/cColumnReports', label: 'C Column Reports' },
        { to: '/dColumnReports', label: 'D Column Reports' },
        { to: '/billingReports', label: 'Billing Report' },
        { to: '/tagwiseReport', label: 'Tagwise Report' },
        { to: '/tagDeleteReport', label: 'Tag Delete Report' },
        { to: '/caratwiseReport', label: 'Caratwise Report' },
      ],
    },
  ]

  return (
    <>
      <style>{`
        .gem-navbar {
          background-color: rgba(9, 9, 11, 0.95) !important;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(250, 204, 21, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          z-index: 1050;
        }

        .gem-brand {
          font-weight: 700;
          font-size: 1.35rem;
          color: #facc15 !important;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        .gem-brand:hover {
          transform: scale(1.05);
        }
        .gem-brand-text {
          background: linear-gradient(90deg, #facc15, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        .gem-nav-link {
          color: #d4d4d8 !important;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.5rem 1rem !important;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .gem-nav-link:hover,
        .gem-nav-link.active {
          color: #facc15 !important;
          background-color: rgba(250, 204, 21, 0.08);
        }

        /* Desktop dropdown */
        .gem-dropdown-toggle::after {
          display: none !important;
        }
        .gem-dropdown-toggle .chev {
          font-size: 0.6rem;
          transition: transform 0.2s ease;
        }
        .gem-dropdown:hover .gem-dropdown-toggle .chev {
          transform: rotate(180deg);
        }

        @media (min-width: 992px) {
          .gem-dropdown:hover > .dropdown-menu {
            display: block;
            margin-top: 0;
            animation: gemFadeIn 0.2s ease;
          }
          .gem-dropdown > .dropdown-menu {
            border: 1px solid rgba(250, 204, 21, 0.2);
            border-radius: 0.75rem;
            background-color: rgba(24, 24, 27, 0.98);
            backdrop-filter: blur(12px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
            padding: 0.5rem;
            min-width: 240px;
            margin-top: 0;
          }
        }

        .gem-dropdown .dropdown-item {
          color: #d4d4d8;
          font-size: 0.88rem;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          transition: all 0.15s ease;
        }
        .gem-dropdown .dropdown-item:hover,
        .gem-dropdown .dropdown-item.active {
          color: #facc15;
          background-color: rgba(250, 204, 21, 0.08);
        }
        .gem-dropdown .dropdown-divider {
          border-color: rgba(250, 204, 21, 0.2);
          margin: 0.4rem 0;
        }

        @keyframes gemFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile menu */
        .gem-mobile-menu {
          position: fixed;
          top: 57px;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(9, 9, 11, 0.98);
          backdrop-filter: blur(12px);
          overflow-y: auto;
          transform: translateY(-10px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.25s ease;
          z-index: 1040;
          padding: 1rem 1.25rem 2rem;
        }
        .gem-mobile-menu.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .gem-mobile-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: transparent;
          border: none;
          color: #e4e4e7;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.85rem 1rem;
          border-radius: 0.6rem;
          text-align: left;
          transition: all 0.15s ease;
        }
        .gem-mobile-item:hover {
          background-color: rgba(250, 204, 21, 0.08);
          color: #facc15;
        }
        .gem-mobile-item .chev {
          font-size: 0.7rem;
          transition: transform 0.2s ease;
        }
        .gem-mobile-item .chev.rotated {
          transform: rotate(180deg);
          color: #facc15;
        }

        .gem-mobile-submenu {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease;
          margin-left: 0.5rem;
          padding-left: 0.75rem;
          border-left: 2px solid rgba(250, 204, 21, 0.25);
          margin-top: 0.25rem;
        }
        .gem-mobile-submenu.open {
          max-height: 600px;
        }

        .gem-mobile-link {
          display: block;
          color: #a1a1aa;
          font-size: 0.88rem;
          padding: 0.55rem 0.85rem;
          border-radius: 0.5rem;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .gem-mobile-link:hover,
        .gem-mobile-link.active {
          color: #facc15;
          background-color: rgba(250, 204, 21, 0.06);
        }

        .gem-toggler {
          border: 1px solid rgba(250, 204, 21, 0.3);
          color: #facc15;
          padding: 0.35rem 0.6rem;
          border-radius: 0.5rem;
          background: transparent;
          font-size: 1.15rem;
          transition: all 0.15s ease;
        }
        .gem-toggler:hover {
          background-color: rgba(250, 204, 21, 0.1);
        }
      `}</style>

      <nav
        ref={navRef}
        className="navbar navbar-expand-lg gem-navbar sticky-top py-2"
      >
        <div className="container-fluid px-3 px-sm-4 px-lg-5">

          {/* Brand */}
          <Link to="/" className="gem-brand">
            <FaGem />
            <span className="gem-brand-text">GemStore</span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="gem-toggler d-lg-none"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Desktop Menu */}
          <div className="collapse navbar-collapse d-none d-lg-flex">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
              <li className="nav-item">
                <Link
                  to="/"
                  className={`gem-nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                  Home
                </Link>
              </li>

              {menuItems.map((item) => (
                <li key={item.label} className="nav-item dropdown gem-dropdown">
                  <button
                    type="button"
                    className="gem-nav-link gem-dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {item.label}
                    <FaChevronDown className="chev" />
                  </button>
                  <ul className="dropdown-menu">
                    {item.links.map((link, idx) =>
                      link.divider ? (
                        <li key={`div-${idx}`}>
                          <hr className="dropdown-divider" />
                        </li>
                      ) : (
                        <li key={link.to}>
                          <Link
                            to={link.to}
                            className={`dropdown-item ${location.pathname === link.to ? 'active' : ''}`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </li>
              ))}

              <li className="nav-item ms-lg-2">
                <Link to="/login">
                  <Button text="Login" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`gem-mobile-menu d-lg-none ${isOpen ? 'open' : ''}`}>
        <Link
          to="/"
          className={`gem-mobile-item ${location.pathname === '/' ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          Home
        </Link>

        {menuItems.map((item) => (
          <div key={item.label} className="mb-1">
            <button
              type="button"
              className="gem-mobile-item"
              onClick={() => toggleDropdown(item.label)}
            >
              <span>{item.label}</span>
              <FaChevronDown
                className={`chev ${openDropdown === item.label ? 'rotated' : ''}`}
              />
            </button>

            <div
              className={`gem-mobile-submenu ${
                openDropdown === item.label ? 'open' : ''
              }`}
            >
              {item.links.map((link, idx) =>
                link.divider ? (
                  <hr
                    key={`div-${idx}`}
                    style={{
                      borderColor: 'rgba(250, 204, 21, 0.2)',
                      margin: '0.5rem 0',
                    }}
                  />
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`gem-mobile-link ${
                      location.pathname === link.to ? 'active' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>
        ))}

        <div className="mt-3">
          <Link to="/login" className="d-block">
            <Button text="Login" />
          </Link>
        </div>
      </div>
    </>
  )
}

export default Navbar