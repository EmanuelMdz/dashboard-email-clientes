// Formatear fecha para mostrar
export const formatDate = (date) => {
  if (!date) return ''
  // Si viene como 'YYYY-MM-DD', parsear en zona horaria local para evitar offset UTC
  let d
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, dd] = date.split('-').map(Number)
    d = new Date(y, m - 1, dd)
  } else {
    d = new Date(date)
  }
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Formatear fecha y hora
export const formatDateTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Obtener fecha en formato YYYY-MM-DD
export const formatDateForInput = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  // Formatear en horario local para evitar desfases por UTC
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Obtener fecha de hace X días
export const getDaysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Obtener inicio del mes actual
export const getStartOfMonth = () => {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// Obtener fin del mes actual
export const getEndOfMonth = () => {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

// Obtener rango de fechas predefinido
export const getDateRange = (range) => {
  const today = new Date()
  let startDate, endDate = today
  
  switch (range) {
    case 'today':
      startDate = new Date(today)
      endDate = new Date(today)
      break
    case 'yesterday':
      startDate = getDaysAgo(1)
      endDate = getDaysAgo(1)
      break
    case 'last7days':
      // Últimos 7 días inclusivos: hoy y los 6 anteriores
      startDate = getDaysAgo(6)
      endDate = new Date(today)
      break
    case 'last30days':
      // Últimos 30 días inclusivos: hoy y los 29 anteriores
      startDate = getDaysAgo(29)
      endDate = new Date(today)
      break
    case 'thisMonth':
      startDate = getStartOfMonth()
      endDate = new Date(today)
      break
    case 'lastMonth':
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      startDate = lastMonth
      endDate = new Date(today.getFullYear(), today.getMonth(), 0)
      break
    default:
      // Por defecto, últimos 30 días inclusivos
      startDate = getDaysAgo(29)
      endDate = new Date(today)
  }
  
  return {
    startDate: formatDateForInput(startDate),
    endDate: formatDateForInput(endDate)
  }
}

// Generar array de fechas entre dos fechas
export const getDatesBetween = (startDate, endDate) => {
  const dates = []
  // Parsear como fechas locales (no UTC) para evitar desfases
  const parseLocal = (s) => {
    const [y, m, d] = String(s).split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
  }
  const start = parseLocal(startDate)
  const end = parseLocal(endDate)
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDateForInput(new Date(d)))
  }
  
  return dates
}

// Validar si una fecha es válida
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date)
}

// Comparar fechas
export const compareDates = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  if (d1 < d2) return -1
  if (d1 > d2) return 1
  return 0
}

// Obtener nombre del día de la semana
export const getDayName = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { weekday: 'long' })
}

// Obtener nombre del mes
export const getMonthName = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { month: 'long' })
}
