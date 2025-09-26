import { supabase } from './supabase.js'

// Función para hacer login
export const login = async (email, password) => {
  try {
    // Buscar el cliente por email
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (error || !client) {
      throw new Error('Credenciales inválidas')
    }
    
    // Por simplicidad, comparamos la contraseña directamente
    // En producción deberías usar bcrypt o similar
    if (client.password_hash !== password) {
      throw new Error('Credenciales inválidas')
    }
    
    // Guardar sesión en localStorage
    const sessionData = {
      user: {
        id: client.id,
        email: client.email,
        name: client.name,
        role: client.role
      },
      timestamp: Date.now()
    }
    
    localStorage.setItem('dashboard_session', JSON.stringify(sessionData))
    
    return sessionData.user
  } catch (error) {
    throw error
  }
}

// Función para logout
export const logout = () => {
  localStorage.removeItem('dashboard_session')
}

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
