import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/auth.js'
import Button from '../../components/common/Button/Button.js'
import Card from '../../components/common/Card/Card.js'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error al escribir
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Dashboard de Campañas</h1>
          <p className="login-subtitle">Gestión de Email Marketing</p>
        </div>

        <Card className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${error ? 'form-input--error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${error ? 'form-input--error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="login-button"
            >
              Iniciar Sesión
            </Button>
          </form>
        </Card>

        <div className="login-footer">
          <p className="login-info">
            Acceso exclusivo para clientes registrados
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
