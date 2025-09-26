import { formatDate, formatDateTime } from './dateHelpers.js'

// Función para convertir datos a CSV
export const convertToCSV = (data, headers = null) => {
  if (!data || data.length === 0) {
    return ''
  }
  
  // Si no se proporcionan headers, usar las keys del primer objeto
  const csvHeaders = headers || Object.keys(data[0])
  
  // Crear la fila de headers
  const headerRow = csvHeaders.join(',')
  
  // Crear las filas de datos
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      let value = row[header] || ''
      
      // Escapar comillas y comas
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""')
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`
        }
      }
      
      return value
    }).join(',')
  })
  
  return [headerRow, ...dataRows].join('\n')
}

// Función para descargar archivo CSV
export const downloadCSV = (data, filename, headers = null) => {
  const csv = convertToCSV(data, headers)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  
  // Crear enlace de descarga
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Función para exportar métricas de campaña
export const exportCampaignMetrics = (metrics, campaignName) => {
  const formattedData = metrics.map(metric => ({
    'Fecha': formatDate(metric.date),
    'Campaña': campaignName,
    'Mensajes Enviados': metric.messages_sent,
    'Respuestas Recibidas': metric.replies_received,
    'Tasa de Respuesta (%)': metric.messages_sent > 0 
      ? ((metric.replies_received / metric.messages_sent) * 100).toFixed(2)
      : '0.00'
  }))
  
  const filename = `metricas_${campaignName.replace(/[^a-zA-Z0-9]/g, '_')}_${formatDate(new Date()).replace(/\//g, '-')}.csv`
  
  downloadCSV(formattedData, filename)
}

// Función para exportar resumen de cliente
export const exportClientSummary = (clientData, campaigns, metrics) => {
  // Calcular totales
  const totalSent = metrics.reduce((sum, m) => sum + m.messages_sent, 0)
  const totalReplies = metrics.reduce((sum, m) => sum + m.replies_received, 0)
  const responseRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(2) : '0.00'
  
  // Crear datos del resumen
  const summaryData = [
    {
      'Cliente': clientData.name,
      'Email': clientData.email,
      'Total Campañas': campaigns.length,
      'Total Mensajes Enviados': totalSent,
      'Total Respuestas': totalReplies,
      'Tasa de Respuesta (%)': responseRate,
      'Fecha Generación': formatDateTime(new Date())
    }
  ]
  
  // Crear datos detallados por campaña
  const campaignData = campaigns.map(campaign => {
    const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id)
    const campaignSent = campaignMetrics.reduce((sum, m) => sum + m.messages_sent, 0)
    const campaignReplies = campaignMetrics.reduce((sum, m) => sum + m.replies_received, 0)
    const campaignRate = campaignSent > 0 ? ((campaignReplies / campaignSent) * 100).toFixed(2) : '0.00'
    
    return {
      'Campaña': campaign.name,
      'Estado': campaign.status,
      'Mensajes Enviados': campaignSent,
      'Respuestas Recibidas': campaignReplies,
      'Tasa de Respuesta (%)': campaignRate,
      'Fecha Creación': formatDate(campaign.created_at),
      'Última Sincronización': formatDateTime(campaign.last_synced)
    }
  })
  
  const filename = `resumen_${clientData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${formatDate(new Date()).replace(/\//g, '-')}.csv`
  
  // Combinar resumen y detalle
  const allData = [
    ...summaryData,
    {}, // Fila vacía como separador
    ...campaignData
  ]
  
  downloadCSV(allData, filename)
}

// Función para exportar métricas diarias detalladas
export const exportDailyMetrics = (metrics, clientName = null) => {
  const formattedData = metrics.map(metric => ({
    'Fecha': formatDate(metric.date),
    'Campaña': metric.campaigns?.name || 'N/A',
    'Cliente': clientName || 'N/A',
    'Mensajes Enviados': metric.messages_sent,
    'Respuestas Recibidas': metric.replies_received,
    'Tasa de Respuesta (%)': metric.messages_sent > 0 
      ? ((metric.replies_received / metric.messages_sent) * 100).toFixed(2)
      : '0.00'
  }))
  
  const filename = `metricas_diarias_${clientName ? clientName.replace(/[^a-zA-Z0-9]/g, '_') + '_' : ''}${formatDate(new Date()).replace(/\//g, '-')}.csv`
  
  downloadCSV(formattedData, filename)
}

// Función para exportar lista de clientes (solo admin)
export const exportClientsList = (clients) => {
  const formattedData = clients.map(client => ({
    'Nombre': client.name,
    'Email': client.email,
    'Rol': client.role,
    'Estado': client.is_active ? 'Activo' : 'Inactivo',
    'Fecha Creación': formatDate(client.created_at)
  }))
  
  const filename = `lista_clientes_${formatDate(new Date()).replace(/\//g, '-')}.csv`
  
  downloadCSV(formattedData, filename)
}

// Función para validar datos antes de exportar
export const validateExportData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No hay datos para exportar')
  }
  
  return true
}
