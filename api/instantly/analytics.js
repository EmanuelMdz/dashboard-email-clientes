// API Route para obtener analytics de campañas de Instantly
export default async function handler(req, res) {
  // Solo permitir GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
    
    // Agregar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('Error in analytics API:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
