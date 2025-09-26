// Servidor simple para desarrollo que maneja las API routes
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Cargar variables de entorno
import dotenv from 'dotenv'
dotenv.config()

// Importar y configurar la función de API
const campaignsHandler = async (req, res) => {
  try {
    const API_KEY = process.env.VITE_INSTANTLY_API_KEY
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    // Construir URL con parámetros
    const { limit = '50', search, starting_after, tag_ids } = req.query
    
    const params = new URLSearchParams({ limit })
    if (search) params.append('search', search)
    if (starting_after) params.append('starting_after', starting_after)
    if (tag_ids) params.append('tag_ids', tag_ids)

    const url = `https://api.instantly.ai/api/v2/campaigns?${params.toString()}`
    
    console.log('Fetching from Instantly:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Instantly API error:', response.status, errorText)
      return res.status(response.status).json({ 
        error: `Instantly API error: ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('Error in campaigns API:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}

// Handler para analytics
const analyticsHandler = async (req, res) => {
  try {
    const API_KEY = process.env.VITE_INSTANTLY_API_KEY
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const { campaign_id, start_date, end_date, type = 'daily' } = req.query
    
    if (!campaign_id) {
      return res.status(400).json({ error: 'campaign_id is required' })
    }

    // Construir URL según el tipo de analytics - usando el formato exacto de la documentación
    let url
    
    if (type === 'overview') {
      // Para overview, usar 'id' en lugar de 'campaign_id'
      const params = new URLSearchParams({ 
        id: campaign_id,
        campaign_status: '1'
      })
      if (start_date) params.append('start_date', start_date)
      if (end_date) params.append('end_date', end_date)
      
      url = `https://api.instantly.ai/api/v2/campaigns/analytics/overview?${params.toString()}`
    } else {
      // Para daily analytics - formato exacto de la documentación
      const params = new URLSearchParams({
        campaign_id: campaign_id,
        campaign_status: '1'
      })
      if (start_date) params.append('start_date', start_date)
      if (end_date) params.append('end_date', end_date)
      
      url = `https://api.instantly.ai/api/v2/campaigns/analytics/daily?${params.toString()}`
    }
    
    console.log('Fetching analytics from Instantly:', url)
    console.log('Request params:', { campaign_id, start_date, end_date, type })
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Instantly Analytics API error:', response.status, errorText)
      return res.status(response.status).json({ 
        error: `Instantly API error: ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('Error in analytics API:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}

// Handler para campaña específica
const campaignHandler = async (req, res) => {
  try {
    const API_KEY = process.env.VITE_INSTANTLY_API_KEY
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const { campaign_id } = req.query
    
    if (!campaign_id) {
      return res.status(400).json({ error: 'campaign_id is required' })
    }

    const url = `https://api.instantly.ai/api/v2/campaigns/${campaign_id}`
    
    console.log('Fetching campaign data from Instantly:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Instantly Campaign API error:', response.status, errorText)
      return res.status(response.status).json({ 
        error: `Instantly API error: ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('Error in campaign API:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}

// Handler para n8n campaigns (proxy para evitar CORS)
const n8nCampaignsHandler = async (req, res) => {
  try {
    const N8N_URL = 'https://ssn8nwebhookss.ainnovateagency.com/webhook/get-campaigns'
    
    console.log('Proxying to n8n campaigns:', N8N_URL)
    
    const response = await fetch(N8N_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('N8N campaigns error:', response.status, errorText)
      return res.status(response.status).json({ 
        error: `N8N error: ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    console.log('N8N campaigns response:', data)
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('Error in n8n campaigns proxy:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}

// Handler para n8n daily analytics (proxy para evitar CORS)
const n8nDailyHandler = async (req, res) => {
  try {
    const { campaign_id, start_date, end_date } = req.query
    
    if (!campaign_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'campaign_id, start_date y end_date son requeridos' })
    }

    const params = new URLSearchParams({
      campaign_id,
      start_date,
      end_date
    })
    
    const N8N_URL = `https://ssn8nwebhookss.ainnovateagency.com/webhook/get-data-daily-campaign?${params.toString()}`
    
    console.log('Proxying to n8n daily:', N8N_URL)
    
    const response = await fetch(N8N_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('N8N daily error:', response.status, errorText)
      return res.status(response.status).json({ 
        error: `N8N error: ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    console.log('N8N daily response:', data)
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('Error in n8n daily proxy:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}

// Rutas de API
app.get('/api/instantly/campaigns', campaignsHandler)
app.get('/api/instantly/analytics', analyticsHandler)
app.get('/api/instantly/campaign', campaignHandler)
app.get('/api/n8n/campaigns', n8nCampaignsHandler)
app.get('/api/n8n/daily', n8nDailyHandler)

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server working!' })
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`)
  console.log(`Campaigns endpoint: http://localhost:${PORT}/api/instantly/campaigns`)
})
