import './Select.css'

const Select = ({ 
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  loading = false,
  error = false,
  className = '',
  name,
  id,
  ...props 
}) => {
  const selectClass = `
    select 
    ${error ? 'select--error' : ''}
    ${disabled ? 'select--disabled' : ''}
    ${loading ? 'select--loading' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className="select-container">
      <select
        id={id}
        name={name}
        className={selectClass}
        value={value || ''}
        onChange={onChange}
        disabled={disabled || loading}
        {...props}
      >
        <option value="" disabled>
          {loading ? 'Cargando...' : placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      <div className="select__icon">
        {loading ? (
          <div className="select__spinner"></div>
        ) : (
          <svg 
            className="select__arrow" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        )}
      </div>
    </div>
  )
}

export default Select
