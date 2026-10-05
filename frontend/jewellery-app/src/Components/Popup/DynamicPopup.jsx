import React, { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'

const DynamicPopup = ({ isOpen, title, children, onClose, size = 'lg' }) => {
  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Escape key se close
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeMap = { sm: '420px', md: '600px', lg: '800px', xl: '1000px' }

  return (
    <>
      <style>{`
        @keyframes gemPopupIn {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gemBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .gem-popup-backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1060;
          animation: gemBackdropIn 0.2s ease;
        }
        .gem-popup-wrap {
          position: fixed; inset: 0;
          z-index: 1070;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 1.5rem 1rem;
          overflow-y: auto;
        }
        .gem-popup {
          background: linear-gradient(160deg, #18181b 0%, #0f0f12 100%);
          border: 1px solid rgba(250, 204, 21, 0.2);
          border-radius: 1rem;
          width: 100%;
          max-width: ${sizeMap[size] || sizeMap.lg};
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
          animation: gemPopupIn 0.25s ease;
          margin: auto 0;
        }
        .gem-popup-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(250, 204, 21, 0.15);
          position: sticky;
          top: 0;
          background: linear-gradient(160deg, #18181b 0%, #0f0f12 100%);
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          z-index: 2;
        }
        .gem-popup-title {
          color: #facc15; font-weight: 700; font-size: 1.1rem; margin: 0;
        }
        .gem-popup-close {
          background: transparent;
          border: none;
          color: #a1a1aa;
          font-size: 1rem;
          width: 34px;
          height: 34px;
          border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .gem-popup-close:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        .gem-popup-body {
          padding: 1.5rem;
        }
        @media (max-width: 640px) {
          .gem-popup-header { padding: 0.85rem 1rem; }
          .gem-popup-body { padding: 1rem; }
          .gem-popup-title { font-size: 1rem; }
        }
      `}</style>

      {/* Backdrop */}
      <div className="gem-popup-backdrop" onClick={onClose}></div>

      {/* Popup */}
      <div
        className="gem-popup-wrap"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.()
        }}
      >
        <div className="gem-popup" role="dialog" aria-modal="true">
          <div className="gem-popup-header">
            <h5 className="gem-popup-title">{title}</h5>
            <button
              className="gem-popup-close"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <FaTimes />
            </button>
          </div>

          <div className="gem-popup-body">{children}</div>
        </div>
      </div>
    </>
  )
}

export default DynamicPopup