// API Route para obtener campañas de Instantly
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
    
    // Agregar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('Error in campaigns API:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
