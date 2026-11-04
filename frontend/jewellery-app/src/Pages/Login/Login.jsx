import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../Components/Bottons/Button'
import { FaGem, FaUser, FaLock } from 'react-icons/fa'
import { toast } from 'react-toastify'

const Login = ({ setIsLoggedIn }) => {
  const [formValues, setFormValues] = useState({ userName: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!formValues.userName || !formValues.password) {
      toast.warning('Please enter username and password')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      })
      
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setIsLoggedIn(true)
        toast.success('Welcome Admin!')
        navigate('/dashboard') // 👈 Login ke baad Dashboard pe bhejenge
      } else {
        toast.error(data.message || 'Invalid credentials')
      }
    } catch (err) {
      console.error(err)
      toast.error('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#09090b' }}>
      <div className="w-100 px-3" style={{ maxWidth: '420px' }}>
        
        {/* Login Form Card */}
        <div className="rounded-4 p-4 p-sm-5" style={{
          background: 'linear-gradient(160deg, #18181b 0%, #0f0f12 100%)',
          border: '1px solid rgba(250, 204, 21, 0.15)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 60, height: 60, background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}>
              <FaGem size={28} />
            </div>
            <h3 className="fw-bold text-warning mb-1">Admin Login</h3>
            <p className="small text-secondary">Sign in to access GemStore Dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label text-light small">Username</label>
              <div className="input-group">
                <span className="input-group-text border-0" style={{ background: '#18181b', color: '#facc15' }}>
                  <FaUser />
                </span>
                <input 
                  type="text" 
                  name="userName" 
                  className="form-control border-0 text-dark fw-bold" 
                  placeholder="Enter username" 
                  value={formValues.userName}
                  onChange={handleChange}
                  style={{ background: '#f4f4f5' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-light small">Password</label>
              <div className="input-group">
                <span className="input-group-text border-0" style={{ background: '#18181b', color: '#facc15' }}>
                  <FaLock />
                </span>
                <input 
                  type="password" 
                  name="password" 
                  className="form-control border-0 text-dark fw-bold" 
                  placeholder="Enter password" 
                  value={formValues.password}
                  onChange={handleChange}
                  style={{ background: '#f4f4f5' }}
                />
              </div>
            </div>

            <Button 
              text={loading ? 'Logging in...' : 'Login'} 
              className="w-100 py-2 fs-6 fw-bold" 
              onClick={handleLogin}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login