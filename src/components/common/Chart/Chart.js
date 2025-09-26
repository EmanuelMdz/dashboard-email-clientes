import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import './Chart.css'

// Preload watermark image from public path
const watermarkImage = new Image()
watermarkImage.src = '/cuadrado_blue_transparente.png'
let watermarkLoaded = false
watermarkImage.onload = () => { watermarkLoaded = true }

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Chart = ({ 
  data, 
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  fill = false,
  className = '',
  watermark = true,
  watermarkOpacity = 0.06,
  ...props 
}) => {
  // Watermark plugin draws the brand logo centered in the chart area
  const watermarkPlugin = {
    id: 'brandWatermark',
    afterDraw: (chart) => {
      if (!watermark || !watermarkLoaded) return
      const { ctx, chartArea } = chart
      if (!chartArea) return
      const { left, top, width, height } = chartArea
      const size = Math.min(width, height) * 1
      const x = left + (width - size) / 2
      const y = top + (height - size) / 2
      ctx.save()
      ctx.globalAlpha = watermarkOpacity
      ctx.drawImage(watermarkImage, x, y, size, size)
      ctx.restore()
    }
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 3
      },
      line: {
        borderWidth: 2,
        tension: 0,
        fill: fill,
        spanGaps: true
      }
    },
    spanGaps: true
  }

  const chartClass = `chart-container ${className}`.trim()

  return (
    <div className={chartClass} style={{ height: `${height}px` }}>
      <Line data={data} options={options} plugins={[watermarkPlugin]} {...props} />
    </div>
  )
}

// Función helper para crear datos de gráfico
export const createChartData = (labels, datasets) => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16'  // lime
  ]

  return {
    labels,
    datasets: datasets.map((dataset, index) => {
      const color = dataset.borderColor || colors[index % colors.length]
      
      // Aplicar gradientes según el tipo de dataset
      let backgroundColor = dataset.backgroundColor
      let shouldFill = dataset.fill
      
      if (!backgroundColor) {
        if (index === 0 && dataset.label && dataset.label.includes('Mensajes')) {
          // Crear gradiente azul para "Mensajes Enviados"
          backgroundColor = (ctx) => {
            const canvas = ctx.chart.ctx
            const gradient = canvas.createLinearGradient(0, 0, 0, 400)
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)')
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)')
            return gradient
          }
          shouldFill = true
        } else if (dataset.label && dataset.label.includes('Respuestas')) {
          // Crear gradiente verde para "Respuestas Recibidas"
          backgroundColor = (ctx) => {
            const canvas = ctx.chart.ctx
            const gradient = canvas.createLinearGradient(0, 0, 0, 400)
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
            gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)')
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)')
            return gradient
          }
          shouldFill = true
        } else {
          backgroundColor = dataset.fill ? `${color}20` : color
        }
      }

      return {
        ...dataset,
        borderColor: color,
        backgroundColor,
        pointBackgroundColor: dataset.pointBackgroundColor || color,
        pointBorderColor: dataset.pointBorderColor || '#ffffff',
        fill: shouldFill
      }
    })
  }
}

export default Chart
