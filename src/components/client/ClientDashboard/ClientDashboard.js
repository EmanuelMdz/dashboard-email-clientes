import { useState, useEffect } from 'react'
import { logout } from '../../../services/auth.js'
import { getCampaigns } from '../../../services/supabase.js'
import { getRealTimeMetrics, getInterestStats } from '../../../services/instantly.js'
import { exportClientSummary, exportDailyMetrics } from '../../../utils/exportHelpers.js'
import { getDateRange } from '../../../utils/dateHelpers.js'
import Button from '../../common/Button/Button.js'
import Card from '../../common/Card/Card.js'
import Select from '../../common/Select/Select.js'
import DatePicker, { DateRangePicker } from '../../common/DatePicker/DatePicker.js'
import CampaignMetrics from '../CampaignMetrics/CampaignMetrics.js'
import InterestStats from '../InterestStats/InterestStats.js'
import BrandHeader from '../../common/Header/Header.js'
import './ClientDashboard.css'

const ClientDashboard = ({ user }) => {
  const [campaigns, setCampaigns] = useState([])
  const [metrics, setMetrics] = useState([])
  const [interestData, setInterestData] = useState(null)
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
      
      const clientCampaigns = await getCampaigns(user.id)
      setCampaigns(clientCampaigns)
      
    } catch (err) {
      setError('Error al cargar las campañas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMetrics = async () => {
    try {
      if (loadingMetrics) {
        return
      }
      setLoadingMetrics(true)
      setError('')
      
      const campaignsToLoad = selectedCampaign === 'all' 
        ? campaigns
        : campaigns.filter(c => c.id === selectedCampaign)

      const allMetrics = []
      
      for (const campaign of campaignsToLoad) {
        if (!campaign.instantly_campaign_id) {
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

      setMetrics(allMetrics)
      
      // Cargar estadísticas de interés desde n8n
      try {
        const campaignInstantlyIds = campaignsToLoad
          .filter(c => c.instantly_campaign_id)
          .map(c => c.instantly_campaign_id)
        
        if (campaignInstantlyIds.length > 0) {
          const interest = await getInterestStats(
            campaignInstantlyIds,
            dateRange.startDate,
            dateRange.endDate
          )
          setInterestData(interest)
        } else {
          setInterestData(null)
        }
      } catch (interestErr) {
        // No mostrar error
        setInterestData(null)
      }
      
      // Siempre limpiar error si la carga fue exitosa, aunque no haya datos
      setError('')
    } catch (err) {
      setError('Error al cargar las métricas desde Instantly: ' + err.message)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      setError('')
      
      // Cargar métricas directamente desde Instantly
      await loadMetrics()
      
    } catch (err) {
      setError('Error al cargar métricas en tiempo real: ' + err.message)
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
                interestData={interestData}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ClientDashboard
