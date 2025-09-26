// API Route para obtener datos específicos de una campaña de Instantly
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
    
    // Agregar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('Error in campaign API:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
