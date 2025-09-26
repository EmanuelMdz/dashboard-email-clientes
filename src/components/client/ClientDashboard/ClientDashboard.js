import { useState, useEffect } from 'react'
import { logout } from '../../../services/auth.js'
import { getCampaigns } from '../../../services/supabase.js'
import { getRealTimeMetrics } from '../../../services/instantly.js'
import { exportClientSummary, exportDailyMetrics } from '../../../utils/exportHelpers.js'
import { getDateRange } from '../../../utils/dateHelpers.js'
import Button from '../../common/Button/Button.js'
import Card from '../../common/Card/Card.js'
import Select from '../../common/Select/Select.js'
import DatePicker, { DateRangePicker } from '../../common/DatePicker/DatePicker.js'
import CampaignMetrics from '../CampaignMetrics/CampaignMetrics.js'
import BrandHeader from '../../common/Header/Header.js'
import './ClientDashboard.css'

const ClientDashboard = ({ user }) => {
  const [campaigns, setCampaigns] = useState([])
  const [metrics, setMetrics] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('all')
  const [dateRange, setDateRange] = useState(() => getDateRange('last30days'))
  const [loading, setLoading] = useState(true)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')

  // Cargar campañas del cliente
  useEffect(() => {
    loadClientData()
  }, [user.id])

  // Cargar métricas cuando cambian los filtros
  useEffect(() => {
    if (campaigns.length > 0) {
      loadMetrics()
    }
  }, [selectedCampaign, dateRange, campaigns])

  const loadClientData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Loading campaigns for client:', user.id)
      const clientCampaigns = await getCampaigns(user.id)
      console.log('Client campaigns loaded:', clientCampaigns)
      setCampaigns(clientCampaigns)
      
    } catch (err) {
      setError('Error al cargar las campañas: ' + err.message)
      console.error('Error loading client data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMetrics = async () => {
    try {
      if (loadingMetrics) {
        console.log('loadMetrics: skipped (already running)')
        return
      }
      setLoadingMetrics(true)
      setError('')
      console.log('=== STARTING loadMetrics ===')
      console.log('Selected date range:', dateRange.startDate, '->', dateRange.endDate)
      
      const campaignsToLoad = selectedCampaign === 'all' 
        ? campaigns
        : campaigns.filter(c => c.id === selectedCampaign)

      console.log('Campaigns to load:', campaignsToLoad.length)
      const allMetrics = []
      
      for (const campaign of campaignsToLoad) {
        console.log('Loading daily metrics by ID (n8n real-time):', campaign.name, campaign.instantly_campaign_id)
        if (!campaign.instantly_campaign_id) {
          console.warn('Campaign missing instantly_campaign_id. Skipping:', campaign)
          continue
        }
        const metrics = await getRealTimeMetrics(
          campaign.id,
          campaign.instantly_campaign_id,
          dateRange.startDate,
          dateRange.endDate
        )
        allMetrics.push(...metrics)
      }

      console.log('=== FINISHED loadMetrics - Total entries:', allMetrics.length, '===')
      setMetrics(allMetrics)
      // Siempre limpiar error si la carga fue exitosa, aunque no haya datos
      setError('')
    } catch (err) {
      setError('Error al cargar las métricas desde Instantly: ' + err.message)
      console.error('Error loading real-time metrics:', err)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      setError('')
      
      console.log('=== Reloading real-time metrics from Instantly ===')
      
      // Cargar métricas directamente desde Instantly
      await loadMetrics()
      
    } catch (err) {
      setError('Error al cargar métricas en tiempo real: ' + err.message)
      console.error('Error loading real-time metrics:', err)
    } finally {
      setSyncing(false)
    }
  }

  const handleExportSummary = () => {
    try {
      exportClientSummary(user, campaigns, metrics)
    } catch (err) {
      setError('Error al exportar: ' + err.message)
    }
  }

  const handleExportMetrics = () => {
    try {
      exportDailyMetrics(metrics, user.name)
    } catch (err) {
      setError('Error al exportar: ' + err.message)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const campaignOptions = [
    { value: 'all', label: 'Todas las campañas' },
    ...campaigns.map(campaign => ({
      value: campaign.id,
      label: campaign.name
    }))
  ]

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'last7days', label: 'Últimos 7 días' },
    { value: 'last30days', label: 'Últimos 30 días' },
    { value: 'thisMonth', label: 'Este mes' },
    { value: 'lastMonth', label: 'Mes pasado' },
    { value: 'custom', label: 'Personalizado' }
  ]

  const [selectedDateRange, setSelectedDateRange] = useState('last30days')
  const [showCustomRange, setShowCustomRange] = useState(false)

  const handleDateRangeChange = (value) => {
    setSelectedDateRange(value)
    
    if (value === 'custom') {
      setShowCustomRange(true)
    } else {
      setShowCustomRange(false)
      setDateRange(getDateRange(value))
    }
  }

  const handleCustomDateChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate })
  }

  return (
    <div className="client-dashboard">
      {/* Header */}
      <BrandHeader 
        title="Dashboard de Campañas" 
        subtitle={`Bienvenido, ${user.name}`}
        actions={(
          <>
            <Button
              variant="secondary"
              onClick={handleSync}
              loading={syncing}
              disabled={campaigns.length === 0}
            >
              Cargar Datos en Tiempo Real
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </>
        )}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {error && (
            <Card variant="danger" className="error-card">
              {error}
            </Card>
          )}

          {loading ? (
            <div className="dashboard-loading">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="empty-state">
              <div className="empty-content">
                <h3>No hay campañas asignadas</h3>
                <p>Contacta con el administrador para que te asigne campañas.</p>
                <p className="debug-info">Usuario ID: {user.id}</p>
                <Button
                  variant="secondary"
                  onClick={loadClientData}
                  loading={loading}
                >
                  Recargar Campañas
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Filtros */}
              <Card title="Filtros" className="filters-card">
                <div className="filters-grid">
                  <div className="filter-group">
                    <label className="filter-label">Campaña</label>
                    <Select
                      options={campaignOptions}
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      placeholder="Seleccionar campaña"
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">Período</label>
                    <Select
                      options={dateRangeOptions}
                      value={selectedDateRange}
                      onChange={(e) => handleDateRangeChange(e.target.value)}
                      placeholder="Seleccionar período"
                    />
                  </div>
                  
                  <div className="filter-actions">
                    <Button
                      variant="secondary"
                      onClick={handleExportSummary}
                      disabled={metrics.length === 0}
                    >
                      Exportar Resumen
                    </Button>
                    
                    <Button
                      variant="secondary"
                      onClick={handleExportMetrics}
                      disabled={metrics.length === 0}
                    >
                      Exportar Métricas
                    </Button>
                  </div>
                </div>
                
                {showCustomRange && (
                  <div className="custom-range">
                    <DateRangePicker
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      onStartDateChange={(date) => handleCustomDateChange(date, dateRange.endDate)}
                      onEndDateChange={(date) => handleCustomDateChange(dateRange.startDate, date)}
                    />
                  </div>
                )}
              </Card>

              {/* Métricas */}
              <CampaignMetrics
                campaigns={campaigns}
                metrics={metrics}
                selectedCampaign={selectedCampaign}
                dateRange={dateRange}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ClientDashboard
