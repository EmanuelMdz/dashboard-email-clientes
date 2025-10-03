import Card from '../../common/Card/Card.js'
import './InterestStats.css'

const InterestStats = ({ interestData, totalUniqueReplies = 0 }) => {
  if (!interestData) {
    return null
  }

  // Los datos vienen dentro de body
  const data = interestData.body || interestData
  
  console.log('=== InterestStats Debug ===')
  console.log('Raw data:', data)
  console.log('totalUniqueReplies (prop):', totalUniqueReplies)
  console.log('data.total_opportunities:', data.total_opportunities)
  console.log('data.total_interested:', data.total_interested)
  console.log('data.reply_count_unique:', data.reply_count_unique)
  
  // total_opportunities son los interesados reales
  const interested = Number(data.total_opportunities) || 0
  const notInterested = totalUniqueReplies - interested
  
  console.log('Calculated interested:', interested)
  console.log('Calculated notInterested:', notInterested)
  console.log('Division:', interested, '/', totalUniqueReplies, '=', (interested / totalUniqueReplies) * 100)
  
  const interestedPercent = totalUniqueReplies > 0 
    ? ((interested / totalUniqueReplies) * 100).toFixed(2)
    : '0.00'
  const notInterestedPercent = totalUniqueReplies > 0
    ? ((notInterested / totalUniqueReplies) * 100).toFixed(2)
    : '0.00'
  
  console.log('Final percentages:', { interestedPercent, notInterestedPercent })
  console.log('=== End Debug ===')


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
