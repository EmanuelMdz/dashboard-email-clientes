import { supabase } from './supabase.js'

// Env vars used for direct REST fallback (build-time via Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Función para hacer login
export const login = async (email, password) => {
  try {
    // Consulta directa por REST con apikey en la URL (evita 401 por falta de headers)
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Faltan variables de entorno de Supabase en producción')
    }

    const url = `${SUPABASE_URL}/rest/v1/clients?select=*` +
      `&email=eq.${encodeURIComponent(email)}` +
      `&is_active=eq.true` +
      `&apikey=${SUPABASE_ANON_KEY}`

    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Login API error: ${res.status} ${text}`)
    }
    const arr = await res.json()
    const client = Array.isArray(arr) && arr.length ? arr[0] : null

    if (!client) throw new Error('Credenciales inválidas o usuario inactivo')

    // Validación simple de contraseña (solo para demo)
    if (client.password_hash !== password) {
      throw new Error('Credenciales inválidas')
    }

    const sessionData = {
      user: {
        id: client.id,
        email: client.email,
        name: client.name,
        role: client.role,
      },
      timestamp: Date.now(),
    }

    localStorage.setItem('dashboard_session', JSON.stringify(sessionData))
    return sessionData.user
  } catch (error) {
    throw error
  }
};

// Función para logout
export const logout = () => {
  localStorage.removeItem('dashboard_session');
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
  try {
    const sessionData = localStorage.getItem('dashboard_session')
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData)
    
    // Verificar que la sesión no sea muy antigua (opcional)
    // const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 días
    // if (Date.now() - session.timestamp > maxAge) {
    //   logout()
    //   return null
    // }
    
    return session.user
  } catch (error) {
    console.error('Error al obtener usuario actual:', error)
    return null
  }
}

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return getCurrentUser() !== null
}

// Función para verificar si el usuario es admin
export const isAdmin = () => {
  const user = getCurrentUser()
  return user && user.role === 'admin'
}

// Función para verificar si el usuario es cliente
export const isClient = () => {
  const user = getCurrentUser()
  return user && user.role === 'client'
}

// Hook personalizado para usar en componentes React
export const useAuth = () => {
  const user = getCurrentUser()
  
  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    login,
    logout
  }
}
