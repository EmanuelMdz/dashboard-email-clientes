export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    // Parse body safely (Vercel Node may not parse JSON automatically)
    let body = req.body
    if (!body) {
      body = await new Promise((resolve) => {
        let data = ''
        req.on('data', (chunk) => { data += chunk })
        req.on('end', () => {
          try { resolve(JSON.parse(data || '{}')) } catch { resolve({}) }
        })
      })
    }

    const { email, password } = body || req.query || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' })
    }

    const baseUrl = process.env.VITE_SUPABASE_URL
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY
    if (!baseUrl || !anonKey) {
      return res.status(500).json({ error: 'Missing Supabase env vars' })
    }

    const url = `${baseUrl}/rest/v1/clients?select=*` +
      `&email=eq.${encodeURIComponent(email)}` +
      `&is_active=eq.true`

    const upstream = await fetch(url, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return res.status(upstream.status).json({ error: 'Upstream error', details: text })
    }

    const arr = await upstream.json()
    const client = Array.isArray(arr) && arr.length ? arr[0] : null

    if (!client || client.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = { id: client.id, email: client.email, name: client.name, role: client.role }
    return res.status(200).json({ user })
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message })
  }
}
