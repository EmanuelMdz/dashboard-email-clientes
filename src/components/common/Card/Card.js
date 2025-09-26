import './Card.css'

const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  variant = 'default',
  padding = 'medium',
  className = '',
  ...props 
}) => {
  const cardClass = `
    card 
    card--${variant}
    card--padding-${padding}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={cardClass} {...props}>
      {(title || subtitle || actions) && (
        <div className="card__header">
          <div className="card__header-content">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div className="card__actions">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="card__content">
        {children}
      </div>
    </div>
  )
}

export default Card
