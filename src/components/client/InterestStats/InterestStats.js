import Card from '../../common/Card/Card.js'
import './InterestStats.css'

const InterestStats = ({ interestData, totalUniqueReplies = 0 }) => {
  if (!interestData) {
    return null
  }

  // Los datos vienen dentro de body
  const data = interestData.body || interestData
  
  // total_opportunities son los interesados reales
  const interested = Number(data.total_opportunities) || 0
  const notInterested = totalUniqueReplies - interested
  
  const interestedPercent = totalUniqueReplies > 0 
    ? ((interested / totalUniqueReplies) * 100).toFixed(2)
    : '0.00'
  const notInterestedPercent = totalUniqueReplies > 0
    ? ((notInterested / totalUniqueReplies) * 100).toFixed(2)
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

        {totalUniqueReplies > 0 && (
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
          <small>Basado en {totalUniqueReplies} respuestas únicas</small>
        </div>
      </Card>
    </div>
  )
}

export default InterestStats
