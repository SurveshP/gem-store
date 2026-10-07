import React, { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'

const DynamicPopup = ({
  isOpen,
  title,
  children,
  onClose,
  onSave,
  saveText = 'Save',
  saving = false,
  showFooter = true,
  size = 'lg',
}) => {
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
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          overflow: hidden;
        }
        .gem-popup {
          background: linear-gradient(160deg, #18181b 0%, #0f0f12 100%);
          border: 1px solid rgba(250, 204, 21, 0.2);
          border-radius: 1rem;
          width: 100%;
          max-width: ${sizeMap[size] || sizeMap.lg};
          max-height: calc(100vh - 3rem);
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
          animation: gemPopupIn 0.25s ease;
        }
        .gem-popup-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(250, 204, 21, 0.15);
          background: linear-gradient(160deg, #18181b 0%, #0f0f12 100%);
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          flex-shrink: 0;
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
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }
        .gem-popup-body::-webkit-scrollbar { width: 8px; }
        .gem-popup-body::-webkit-scrollbar-track { background: transparent; }
        .gem-popup-body::-webkit-scrollbar-thumb {
          background: rgba(250, 204, 21, 0.3);
          border-radius: 4px;
        }
        .gem-popup-body::-webkit-scrollbar-thumb:hover {
          background: rgba(250, 204, 21, 0.5);
        }
        .gem-popup-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(250, 204, 21, 0.15);
          background: linear-gradient(160deg, #18181b 0%, #0f0f12 100%);
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          flex-shrink: 0;
        }
        .gem-popup-save-btn {
          background: linear-gradient(135deg, #facc15, #eab308);
          color: #18181b;
          border: none;
          padding: 0.6rem 2rem;
          border-radius: 0.5rem;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 4px 12px rgba(250, 204, 21, 0.25);
        }
        .gem-popup-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(250, 204, 21, 0.4);
        }
        .gem-popup-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 640px) {
          .gem-popup-header { padding: 0.85rem 1rem; }
          .gem-popup-body { padding: 1rem; }
          .gem-popup-footer { padding: 0.85rem 1rem; }
          .gem-popup-title { font-size: 1rem; }
          .gem-popup { max-height: calc(100vh - 1.5rem); }
          .gem-popup-wrap { padding: 0.75rem; }
        }
      `}</style>

      {/* Backdrop */}
      <div className="gem-popup-backdrop" onClick={onClose}></div>

      {/* Popup */}
      <div className="gem-popup-wrap">
        <div className="gem-popup" role="dialog" aria-modal="true">
          {/* HEADER */}
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

          {/* BODY (scrollable) */}
          <div className="gem-popup-body">{children}</div>

          {/* FOOTER (fixed) */}
          {showFooter && (
            <div className="gem-popup-footer">
              <button
                type="button"
                className="gem-popup-save-btn"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : saveText}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DynamicPopup