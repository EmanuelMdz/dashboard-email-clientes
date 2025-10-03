import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Funciones para clientes
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getClientById = async (id) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export const createClientRecord = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateClientRecord = async (id, updates) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteClientRecord = async (id) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Funciones para campañas
export const getCampaigns = async (clientId = null) => {
  try {
    // Preferir el endpoint serverless en producción para evitar problemas de RLS
    const url = clientId
      ? `/api/campaigns?client_id=${encodeURIComponent(clientId)}`
      : '/api/campaigns'
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      throw new Error(`API campaigns error ${res.status}`)
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (_err) {
    // Fallback: consulta directa a Supabase si la API no está disponible
    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    const { data, error } = await query
    if (error) throw error
    return data
  }
}

export const createCampaign = async (campaignData) => {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaignData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateCampaign = async (id, updates) => {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Función para asignar campañas a un cliente
export const assignCampaignsToClient = async (clientId, campaignIds) => {
  try {
    // Primero, desasignar todas las campañas del cliente
    await supabase
      .from('campaigns')
      .update({ client_id: null })
      .eq('client_id', clientId)
    
    // Luego, asignar las campañas seleccionadas
    if (campaignIds.length > 0) {
      const { error } = await supabase
        .from('campaigns')
        .update({ client_id: clientId })
        .in('id', campaignIds)
      
      if (error) throw error
    }
    
    return true
  } catch (error) {
    throw error
  }
}

// Funciones para métricas
export const getCampaignMetrics = async (campaignId, startDate = null, endDate = null) => {
  let query = supabase
    .from('campaign_metrics')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('date', { ascending: true })
  
  if (startDate) {
    query = query.gte('date', startDate)
  }
  
  if (endDate) {
    query = query.lte('date', endDate)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export const upsertCampaignMetrics = async (metricsData) => {
  const { data, error } = await supabase
    .from('campaign_metrics')
    .upsert(metricsData, { 
      onConflict: 'campaign_id,date',
      ignoreDuplicates: false 
    })
    .select()
  
  if (error) throw error
  return data
}

export const deleteCampaignMetrics = async (campaignId) => {
  const { data, error } = await supabase
    .from('campaign_metrics')
    .delete()
    .eq('campaign_id', campaignId)
  
  if (error) throw error
  return data
}

export const getClientMetricsSummary = async (clientId, startDate = null, endDate = null) => {
  let query = supabase
    .from('campaign_metrics')
    .select(`
      *,
      campaigns!inner(client_id, name)
    `)
    .eq('campaigns.client_id', clientId)
  
  if (startDate) {
    query = query.gte('date', startDate)
  }
  
  if (endDate) {
    query = query.lte('date', endDate)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}
