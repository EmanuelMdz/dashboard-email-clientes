import './Header.css'

const BrandHeader = ({ title, subtitle, actions }) => {
  return (
    <header className="brand-header">
      <div className="container">
        <div className="brand-header__content">
          <div className="brand-header__left">
            <img
              src="/horizontal_blue_transparente.png"
              alt="Brand Logo"
              className="brand-header__logo"
            />
            <div className="brand-header__text">
              {title && <h1 className="brand-header__title">{title}</h1>}
              {subtitle && <p className="brand-header__subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className="brand-header__actions">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default BrandHeader
