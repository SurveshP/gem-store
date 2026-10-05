import React from 'react'
import { Link } from 'react-router-dom'

const Card = ({ title, icon, route }) => {
  return (
    <>
      <style>{`
        .gem-card {
          background: linear-gradient(145deg, #18181b 0%, #0f0f12 100%);
          border: 1px solid rgba(250, 204, 21, 0.15);
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          color: #e4e4e7;
          transition: all 0.25s ease;
          height: 100%;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
        }
        .gem-card:hover {
          transform: translateY(-4px);
          border-color: rgba(250, 204, 21, 0.5);
          box-shadow: 0 15px 35px rgba(250, 204, 21, 0.2);
          color: #facc15;
        }
        .gem-card-icon {
          min-width: 52px;
          height: 52px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(250, 204, 21, 0.1);
          color: #facc15;
          font-size: 1.4rem;
          transition: all 0.25s ease;
        }
        .gem-card:hover .gem-card-icon {
          background: #facc15;
          color: #000;
          transform: scale(1.08) rotate(-3deg);
        }
        .gem-card-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.3;
        }
        .gem-card-arrow {
          margin-left: auto;
          color: #52525b;
          font-size: 0.9rem;
          transition: all 0.25s ease;
        }
        .gem-card:hover .gem-card-arrow {
          color: #facc15;
          transform: translateX(4px);
        }
      `}</style>

      <Link to={route} className="gem-card">
        <div className="gem-card-icon">{icon}</div>
        <div className="flex-grow-1">
          <p className="gem-card-title">{title}</p>
        </div>
        <span className="gem-card-arrow">→</span>
      </Link>
    </>
  )
}

export default Card