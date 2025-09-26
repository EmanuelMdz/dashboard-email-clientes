// Script de prueba para verificar la API de Instantly
import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.VITE_INSTANTLY_API_KEY
const CAMPAIGN_ID = '605f85c7-a324-412c-81b7-ca319bcb063c' // Corregido: 85 en lugar de 55

console.log('Testing Instantly API...')
console.log('API Key:', API_KEY ? 'Present' : 'Missing')
console.log('Campaign ID:', CAMPAIGN_ID)

// Test 1: Verificar que podemos obtener campañas
async function testCampaigns() {
  try {
    console.log('\n=== Test 1: List All Campaigns ===')
    const query = new URLSearchParams({
      limit: '100'
    }).toString()
    
    const url = `https://api.instantly.ai/api/v2/campaigns?${query}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Status:', response.status)
    console.log('URL:', url)
    
    const data = await response.json()
    console.log('Total campaigns found:', data.items?.length || 0)
    
    if (data.items && data.items.length > 0) {
      console.log('\n=== All Available Campaigns ===')
      data.items.forEach((campaign, index) => {
        console.log(`${index + 1}. Name: "${campaign.name}"`)
        console.log(`   ID: ${campaign.id}`)
        console.log(`   Status: ${campaign.status}`)
        console.log(`   Created: ${campaign.created_at || 'N/A'}`)
        console.log('   ---')
      })
      
      // Buscar la campaña específica
      const targetCampaign = data.items.find(c => c.name.includes('ADMV') || c.name.includes('6K_10to50EMP'))
      if (targetCampaign) {
        console.log('\n=== Target Campaign Found ===')
        console.log('Name:', targetCampaign.name)
        console.log('ID:', targetCampaign.id)
        console.log('Status:', targetCampaign.status)
        console.log('Full data:', JSON.stringify(targetCampaign, null, 2))
      } else {
        console.log('\n=== Target Campaign NOT Found ===')
        console.log('Looking for campaigns containing "ADMV" or "6K_10to50EMP"')
      }
    }
    
    return response.ok
  } catch (error) {
    console.error('Error testing campaigns:', error.message)
    return false
  }
}

// Test 2: Probar analytics daily
async function testAnalyticsDaily() {
  try {
    console.log('\n=== Test 2: Analytics Daily ===')
    const params = new URLSearchParams({
      campaign_id: CAMPAIGN_ID,
      start_date: '2025-09-20',
      end_date: '2025-09-26',
      campaign_status: '1'
    })
    
    const url = `https://api.instantly.ai/api/v2/campaigns/analytics/daily?${params.toString()}`
    console.log('URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Analytics data:', data)
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
    
    return response.ok
  } catch (error) {
    console.error('Error testing analytics daily:', error.message)
    return false
  }
}

// Test 3: Probar analytics overview
async function testAnalyticsOverview() {
  try {
    console.log('\n=== Test 3: Analytics Overview ===')
    const params = new URLSearchParams({
      id: CAMPAIGN_ID,
      start_date: '2024-09-01',
      end_date: '2024-09-30',
      campaign_status: '1'
    })
    
    const url = `https://api.instantly.ai/api/v2/campaigns/analytics/overview?${params.toString()}`
    console.log('URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Overview data:', data)
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
    
    return response.ok
  } catch (error) {
    console.error('Error testing analytics overview:', error.message)
    return false
  }
}

// Test 4: Probar obtener campaña específica
async function testSpecificCampaign() {
  try {
    console.log('\n=== Test 4: Specific Campaign ===')
    const url = `https://api.instantly.ai/api/v2/campaigns/${CAMPAIGN_ID}`
    console.log('URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Campaign data:', JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
    
    return response.ok
  } catch (error) {
    console.error('Error testing specific campaign:', error.message)
    return false
  }
}

// Test 5: Probar leads/contacts de la campaña
async function testCampaignLeads() {
  try {
    console.log('\n=== Test 5: Campaign Leads ===')
    const params = new URLSearchParams({
      campaign_id: CAMPAIGN_ID,
      limit: '10'
    })
    
    const url = `https://api.instantly.ai/api/v2/leads?${params.toString()}`
    console.log('URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Leads found:', data.items?.length || 0)
      if (data.items && data.items.length > 0) {
        console.log('First lead:', data.items[0])
      }
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
    
    return response.ok
  } catch (error) {
    console.error('Error testing campaign leads:', error.message)
    return false
  }
}

// Ejecutar todas las pruebas
async function runTests() {
  const test1 = await testCampaigns()
  const test2 = await testAnalyticsDaily()
  const test3 = await testAnalyticsOverview()
  const test4 = await testSpecificCampaign()
  const test5 = await testCampaignLeads()
  
  console.log('\n=== Results ===')
  console.log('Campaigns:', test1 ? '✅' : '❌')
  console.log('Analytics Daily:', test2 ? '✅' : '❌')
  console.log('Analytics Overview:', test3 ? '✅' : '❌')
  console.log('Specific Campaign:', test4 ? '✅' : '❌')
  console.log('Campaign Leads:', test5 ? '✅' : '❌')
}

runTests().catch(console.error)
