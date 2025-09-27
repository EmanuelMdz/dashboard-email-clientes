export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const baseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!baseUrl) {
      return res.status(500).json({ error: 'Missing Supabase URL env var' })
    }
    if (!serviceKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY env var' })
    }

    const { client_id } = req.query || {}

    const url = new URL(`${baseUrl}/rest/v1/campaigns`)
    url.searchParams.set('select', '*')
    if (client_id) url.searchParams.set('client_id', `eq.${client_id}`)
    url.searchParams.set('order', 'created_at.desc')

    const upstream = await fetch(url.toString(), {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=representation'
      }
    })

    if (!upstream.ok) {
      const txt = await upstream.text()
      return res.status(upstream.status).json({ error: 'Upstream error', details: txt })
    }

    const data = await upstream.json()
    return res.status(200).json(Array.isArray(data) ? data : [])
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message })
  }
}
