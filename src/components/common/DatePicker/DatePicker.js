import { formatDateForInput } from '../../../utils/dateHelpers.js'
import './DatePicker.css'

const DatePicker = ({ 
  value,
  onChange,
  min,
  max,
  disabled = false,
  error = false,
  label,
  placeholder = 'Seleccionar fecha',
  className = '',
  name,
  id,
  ...props 
}) => {
  const inputClass = `
    datepicker 
    ${error ? 'datepicker--error' : ''}
    ${disabled ? 'datepicker--disabled' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className="datepicker-container">
      {label && (
        <label 
          htmlFor={id} 
          className="datepicker__label"
        >
          {label}
        </label>
      )}
      
      <div className="datepicker__input-container">
        <input
          type="date"
          id={id}
          name={name}
          className={inputClass}
          value={value || ''}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
          placeholder={placeholder}
          {...props}
        />
        
        <div className="datepicker__icon">
          <svg 
            className="datepicker__calendar-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

// Componente para rango de fechas
export const DateRangePicker = ({ 
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  error = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`daterange-picker ${className}`.trim()}>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        label="Fecha inicio"
        max={endDate || formatDateForInput(new Date())}
        disabled={disabled}
        error={error}
        {...props}
      />
      
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        label="Fecha fin"
        min={startDate}
        max={formatDateForInput(new Date())}
        disabled={disabled}
        error={error}
        {...props}
      />
    </div>
  )
}

export default DatePicker
