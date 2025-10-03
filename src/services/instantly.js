// n8n endpoints (fuente de verdad)
const N8N_GET_CAMPAIGNS_URL = import.meta.env.VITE_N8N_GET_CAMPAIGNS_URL || 'https://ssn8nwebhookss.ainnovateagency.com/webhook/get-campaigns'
const N8N_GET_DAILY_URL = import.meta.env.VITE_N8N_GET_DAILY_URL || 'https://ssn8nwebhookss.ainnovateagency.com/webhook/get-data-daily-campaign'
const N8N_GET_INTEREST_URL = 'https://ssn8nwebhookss.ainnovateagency.com/webhook/get-interest'

// Cache simple para evitar llamadas repetidas a campañas
let campaignsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 30000 // 30 segundos

// Algunos endpoints diarios de Instantly devuelven la fecha "etiqueta" corrida un día
// (ej: datos del 26 aparecen como "2025-09-25"). Para alinear con la UI y el huso local,
// desplazamos +1 día para mostrar.
const shiftDailyDateForDisplay = (dateStr) => {
  try {
    if (!dateStr) return dateStr
    const [y, m, d] = String(dateStr).split('-').map(Number)
    const dt = new Date(y, (m || 1) - 1, d || 1)
    dt.setDate(dt.getDate() + 1)
    const yy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  } catch (_) {
    return dateStr
  }
}

// Helper: desplazar un string YYYY-MM-DD en días (negativo o positivo)
const shiftDateStr = (dateStr, deltaDays) => {
  if (!dateStr || !deltaDays) return dateStr
  const [y, m, d] = String(dateStr).split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  dt.setDate(dt.getDate() + deltaDays)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

// Listar todas las campañas (directo a n8n con CORS configurado + cache)
export const listCampaigns = async (params = {}) => {
  try {
    // Verificar cache
    const now = Date.now()
    if (campaignsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return campaignsCache
    }

    const response = await fetch(N8N_GET_CAMPAIGNS_URL, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const txt = await response.text()
      throw new Error(`n8n campaigns error ${response.status}: ${txt}`)
    }
    
    const data = await response.json()
    
    // Normalizar posibles formas: { items }, { body: { items } }, etc.
    const items = data?.items || data?.body?.items || data?.data?.items || data?.result?.items || []
    const result = { items }
    
    // Guardar en cache
    campaignsCache = result
    cacheTimestamp = now
    
    return result
  } catch (error) {
    throw new Error(`Error al obtener campañas: ${error.message}`)
  }
}

// Función para obtener métricas reales de una campaña desde Instantly (sin guardar en DB)
export const getRealTimeMetrics = async (campaignId, instantlyCampaignId, startDate = null, endDate = null) => {
  // Esta función solo obtiene datos, no los guarda
  return await syncCampaignMetrics(campaignId, instantlyCampaignId, startDate, endDate)
}

// Función para sincronizar métricas reales de una campaña desde Instantly
export const syncCampaignMetrics = async (campaignId, instantlyCampaignId, startDate = null, endDate = null) => {
  try {
    // Las fechas deben venir del selector (obligatorias)
    if (!startDate || !endDate) {
      throw new Error('startDate y endDate son obligatorias para consultar analytics')
    }
    const defaultStartDate = startDate
    const defaultEndDate = endDate
    
    // Obtener analytics diarios directo de n8n (sin corrimiento artificial)
    
    const url = new URL(N8N_GET_DAILY_URL)
    url.searchParams.set('campaign_id', instantlyCampaignId)
    // end_date suele ser exclusivo: para incluir el último día de la UI sumamos +1
    const apiStartDate = defaultStartDate
    const apiEndDate = shiftDateStr(defaultEndDate, 1)
    url.searchParams.set('start_date', apiStartDate)
    url.searchParams.set('end_date', apiEndDate)
    
    const response = await fetch(url.toString(), { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const txt = await response.text()
      throw new Error(`n8n daily analytics error ${response.status}: ${txt}`)
    }
    
    const analyticsData = await response.json()
    
    // Normalizar respuesta de n8n (puede venir como array directo o dentro de body/data/result)
    const dailyData = analyticsData?.body || analyticsData?.data || analyticsData?.result || analyticsData
    let dailyMetrics = []

    if (dailyData && Array.isArray(dailyData)) {
      // Usar los valores DIARIOS tal cual los devuelve la API
      dailyMetrics = dailyData
        .map(dayData => {
          const dayStr = String(dayData.date || '').slice(0, 10)
          if (!dayStr) return null
          return {
            campaign_id: campaignId,
            date: dayStr,
            messages_sent: Number(dayData.sent || 0),
            replies_received: Number(dayData.replies || 0),
            unique_replies: Number(dayData.unique_replies || 0),
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.date.localeCompare(b.date))
    } else {
      // Respuesta inesperada o vacía: no forzar datos
    }
    // Filtrar al rango UI
    const filteredMetrics = dailyMetrics.filter(d => d.date >= defaultStartDate && d.date <= defaultEndDate)
    return filteredMetrics
    
  } catch (error) {
    // Sin fallbacks: si falla o no hay datos, devolver vacío
    return []
  }
}

// Función para validar conexión con Instantly
export const testInstantlyConnection = async () => {
  try {
    // Intentar usar nuestra API route para hacer una prueba real
    const result = await listCampaigns({ limit: '1' })
    
    if (result && (result.items || result.data || result.campaigns)) {
      return { 
        success: true, 
        message: 'Conexión exitosa con Instantly API' 
      }
    } else {
      return { 
        success: true, 
        message: 'Conexión establecida (sin campañas)' 
      }
    }
    
  } catch (error) {
    // Si falla la API route, intentar verificación básica
    const API_KEY = import.meta.env.VITE_INSTANTLY_API_KEY
    
    if (!API_KEY) {
      return { success: false, message: 'API Key no configurada' }
    }
    
    return { 
      success: false, 
      message: `Error de conexión: ${error.message}` 
    }
  }
}

// Función para sincronizar campañas de Instantly a la base de datos
export const syncCampaignsFromInstantly = async () => {
  try {
    // Obtener todas las campañas de Instantly
    const instantlyData = await listCampaigns({ limit: '100' })
    
    if (!instantlyData || !instantlyData.items) {
      throw new Error('No se pudieron obtener las campañas de Instantly')
    }
    
    const campaigns = instantlyData.items
    const results = []
    
    // Importar funciones de Supabase
    const { createCampaign, updateCampaign } = await import('../services/supabase.js')
    
    for (const campaign of campaigns) {
      try {
        const campaignData = {
          instantly_campaign_id: campaign.id,
          name: campaign.name,
          status: campaign.status === 1 ? 'active' : 'inactive',
          client_id: null // Sin asignar inicialmente
        }
        
        // Intentar crear la campaña (si ya existe, fallará por el UNIQUE constraint)
        try {
          await createCampaign(campaignData)
          results.push({ 
            id: campaign.id, 
            name: campaign.name, 
            action: 'created',
            success: true 
          })
        } catch (error) {
          // Si ya existe, intentar actualizarla
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            await updateCampaign(campaign.id, {
              name: campaign.name,
              status: campaign.status === 1 ? 'active' : 'inactive'
            })
            results.push({ 
              id: campaign.id, 
              name: campaign.name, 
              action: 'updated',
              success: true 
            })
          } else {
            throw error
          }
        }
        
      } catch (error) {
        results.push({ 
          id: campaign.id, 
          name: campaign.name, 
          action: 'failed',
          success: false,
          error: error.message 
        })
      }
    }
    
    return {
      success: true,
      message: `Sincronización completada: ${results.filter(r => r.success).length} campañas procesadas`,
      results
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Error en sincronización: ${error.message}`
    }
  }
}

// Función para obtener estadísticas de interés desde n8n
export const getInterestStats = async (campaignIds, startDate, endDate) => {
  try {
    if (!campaignIds || campaignIds.length === 0) {
      throw new Error('Se requiere al menos un ID de campaña')
    }
    
    if (!startDate || !endDate) {
      throw new Error('Se requieren fechas de inicio y fin')
    }

    // Construir query params
    const url = new URL(N8N_GET_INTEREST_URL)
    url.searchParams.set('ids', campaignIds.join(','))
    url.searchParams.set('start_date', startDate)
    url.searchParams.set('end_date', endDate)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`n8n interest error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // Normalizar respuesta de n8n (puede venir como array, objeto directo o dentro de body/data/result)
    let interestData = data?.body || data?.data || data?.result || data
    
    // Si viene como array, tomar el primer elemento
    if (Array.isArray(interestData) && interestData.length > 0) {
      interestData = interestData[0]
    }

    return interestData
    
  } catch (error) {
    throw new Error(`Error al obtener estadísticas de interés: ${error.message}`)
  }
}
