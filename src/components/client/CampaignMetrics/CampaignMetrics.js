import { useMemo } from 'react'
import Card from '../../common/Card/Card.js'
import Chart, { createChartData } from '../../common/Chart/Chart.js'
import Table from '../../common/Table/Table.js'
import { formatDate, getDatesBetween, formatDateForInput } from '../../../utils/dateHelpers.js'
import './CampaignMetrics.css'

const CampaignMetrics = ({ campaigns, metrics, selectedCampaign, dateRange }) => {
  // Calcular totales
  const totals = useMemo(() => {
    const totalSent = metrics.reduce((sum, m) => sum + m.messages_sent, 0)
    const totalReplies = metrics.reduce((sum, m) => sum + m.replies_received, 0)
    const responseRate = totalSent > 0 ? ((totalReplies / totalSent) * 100) : 0

    return {
      totalSent,
      totalReplies,
      responseRate: responseRate.toFixed(2),
      totalCampaigns: selectedCampaign === 'all' ? campaigns.length : 1
    }
  }, [metrics, campaigns, selectedCampaign])

  // Preparar datos para el gráfico (rellenando días vacíos)
  const chartData = useMemo(() => {
    // Crear mapa de métricas por fecha (agregado de todas las campañas)
    const totalsByDate = metrics.reduce((acc, metric) => {
      const date = metric.date
      if (!acc[date]) {
        acc[date] = { sent: 0, replies: 0 }
      }
      acc[date].sent += metric.messages_sent || 0
      acc[date].replies += metric.replies_received || 0
      return acc
    }, {})

    // Generar el rango completo de fechas seleccionado
    let fullDates = getDatesBetween(dateRange.startDate, dateRange.endDate)
    
    // Si el rango es de un solo día, extender artificialmente para mostrar línea
    const isOneDayRange = fullDates.length === 1
    if (isOneDayRange) {
      // Crear un rango artificial de 3 días centrado en el día actual
      const centerDate = fullDates[0]
      const prevDate = new Date(centerDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const nextDate = new Date(centerDate)
      nextDate.setDate(nextDate.getDate() + 1)
      
      fullDates = [
        formatDateForInput(prevDate),
        centerDate,
        formatDateForInput(nextDate)
      ]
    }

    // Construir las series asegurando un valor por cada día del rango
    const labels = fullDates.map(d => formatDate(d))
    let sentSeries = fullDates.map(d => totalsByDate[d]?.sent || 0)
    let repliesSeries = fullDates.map(d => totalsByDate[d]?.replies || 0)

    // Si es un rango de un día, extender el valor a todos los días artificiales
    if (isOneDayRange) {
      const centerValue = totalsByDate[fullDates[1]]
      if (centerValue?.sent > 0) {
        sentSeries = [centerValue.sent, centerValue.sent, centerValue.sent]
      }
      if (centerValue?.replies > 0) {
        repliesSeries = [centerValue.replies, centerValue.replies, centerValue.replies]
      }
    } else {
      // Lógica original para rangos múltiples
      const sentNonZeroIndices = sentSeries.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0)
      const repliesNonZeroIndices = repliesSeries.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0)
      
      if (sentNonZeroIndices.length === 1) {
        const value = sentSeries[sentNonZeroIndices[0]]
        sentSeries = sentSeries.map(() => value)
      }
      
      if (repliesNonZeroIndices.length === 1) {
        const value = repliesSeries[repliesNonZeroIndices[0]]
        repliesSeries = repliesSeries.map(() => value)
      }
    }

    const datasets = [
      {
        label: 'Mensajes Enviados',
        data: sentSeries,
        borderColor: '#3b82f6',
        borderWidth: 3,
        pointRadius: isOneDayRange ? 0 : 5,
        pointHoverRadius: isOneDayRange ? 0 : 7,
        tension: isOneDayRange ? 0 : 0.4,
        spanGaps: true
      },
      {
        label: 'Respuestas Recibidas',
        data: repliesSeries,
        borderColor: '#10b981',
        borderWidth: 2,
        pointRadius: isOneDayRange ? 0 : 4,
        pointHoverRadius: isOneDayRange ? 0 : 6,
        tension: isOneDayRange ? 0 : 0.4,
        spanGaps: true
      }
    ]

    return createChartData(labels, datasets)
  }, [metrics, dateRange])

  // Preparar datos para la tabla
  const tableData = useMemo(() => {
    if (!metrics.length) return []

    return metrics.map(metric => {
      const campaign = campaigns.find(c => c.id === metric.campaign_id)
      const responseRate = metric.messages_sent > 0 
        ? ((metric.replies_received / metric.messages_sent) * 100).toFixed(2)
        : '0.00'

      return {
        id: metric.id,
        date: metric.date,
        campaign_name: campaign?.name || 'N/A',
        messages_sent: metric.messages_sent,
        replies_received: metric.replies_received,
        response_rate: responseRate
      }
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [metrics, campaigns])

  const tableColumns = [
    {
      key: 'date',
      title: 'Fecha',
      render: (value) => formatDate(value)
    },
    {
      key: 'campaign_name',
      title: 'Campaña'
    },
    {
      key: 'messages_sent',
      title: 'Mensajes Enviados',
      align: 'center'
    },
    {
      key: 'replies_received',
      title: 'Respuestas',
      align: 'center'
    },
    {
      key: 'response_rate',
      title: 'Tasa de Respuesta (%)',
      align: 'center',
      render: (value) => `${value}%`
    }
  ]

  // Siempre mostrar el gráfico (con ceros si no hay datos) para ver el rango completo

  return (
    <div className="campaign-metrics">
      {/* Tarjetas de resumen */}
      <div className="metrics-summary">
        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{totals.totalCampaigns}</div>
            <div className="metric-label">
              {totals.totalCampaigns === 1 ? 'Campaña' : 'Campañas'}
            </div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{totals.totalSent.toLocaleString()}</div>
            <div className="metric-label">Mensajes Enviados</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{totals.totalReplies.toLocaleString()}</div>
            <div className="metric-label">Respuestas Recibidas</div>
          </div>
        </Card>

        <Card className="metric-card metric-card--highlight">
          <div className="metric-content">
            <div className="metric-value">{totals.responseRate}%</div>
            <div className="metric-label">Tasa de Respuesta</div>
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      {chartData && (
        <Card title="Evolución Temporal" className="chart-card">
          <Chart 
            data={chartData}
            height={400}
            showLegend={true}
            showGrid={true}
          />
        </Card>
      )}

      {/* Tabla detallada */}
      <Card title="Detalle por Día" className="table-card">
        <Table
          columns={tableColumns}
          data={tableData}
          emptyMessage="No hay métricas para mostrar"
          striped={true}
          hoverable={true}
        />
      </Card>
    </div>
  )
}

export default CampaignMetrics
