import Card from '../../common/Card/Card.js'
import './InterestStats.css'

const InterestStats = ({ interestData, totalUniqueReplies = 0 }) => {
  if (!interestData) {
    return null
  }

  // Los datos vienen dentro de body
  const data = interestData.body || interestData
  
  // total_opportunities son los interesados reales
  // total_interested es el total de respuestas clasificadas (interesados + no interesados)
  const interested = Number(data.total_opportunities) || 0
  const totalClassified = Number(data.total_interested) || 0
  const notInterested = totalClassified - interested
  
  const interestedPercent = totalClassified > 0 
    ? ((interested / totalClassified) * 100).toFixed(2)
    : '0.00'
  const notInterestedPercent = totalClassified > 0
    ? ((notInterested / totalClassified) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="interest-stats">
      <Card title="Análisis de Interés" className="interest-card">
        <div className="interest-grid">
          <div className="interest-item interest-item--positive">
            <div className="interest-icon">✓</div>
            <div className="interest-content">
              <div className="interest-label">Interesados</div>
              <div className="interest-percent">{interestedPercent}%</div>
            </div>
          </div>

          <div className="interest-item interest-item--negative">
            <div className="interest-icon">✗</div>
            <div className="interest-content">
              <div className="interest-label">No Interesados</div>
              <div className="interest-percent">{notInterestedPercent}%</div>
            </div>
          </div>
        </div>

        {totalClassified > 0 && (
          <div className="interest-bar">
            <div 
              className="interest-bar-fill interest-bar-fill--positive"
              style={{ width: `${interestedPercent}%` }}
            />
            <div 
              className="interest-bar-fill interest-bar-fill--negative"
              style={{ width: `${notInterestedPercent}%` }}
            />
          </div>
        )}

        <div className="interest-footer">
          <small>Basado en {totalClassified} respuestas clasificadas</small>
        </div>
      </Card>
    </div>
  )
}

export default InterestStats
