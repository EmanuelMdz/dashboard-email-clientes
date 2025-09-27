import { supabase } from './supabase.js'

// Función para hacer login
export const login = async (email, password) => {
  try {
    // 1. Usar el sistema de autenticación de Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error('Credenciales inválidas');
    }

    if (!data.user) {
        throw new Error('No se pudo autenticar al usuario.');
    }

    // 2. Obtener el perfil del usuario desde la tabla clients
    const { data: client, error: profileError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !client) {
      // Si no se encuentra el perfil, el login falla para evitar inconsistencias.
      await supabase.auth.signOut(); // Cerramos la sesión recién creada
      throw new Error('No se pudo encontrar el perfil del usuario asociado.');
    }

    // 3. Guardar sesión personalizada en localStorage
    const sessionData = {
      user: {
        id: client.id,
        email: client.email,
        name: client.name,
        role: client.role,
      },
      timestamp: Date.now(),
    };
    
    localStorage.setItem('dashboard_session', JSON.stringify(sessionData));
    
    return sessionData.user;
  } catch (error) {
    throw error;
  }
};

// Función para logout
export const logout = async () => {
  await supabase.auth.signOut();
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
