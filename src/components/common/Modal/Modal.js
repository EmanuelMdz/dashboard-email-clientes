import { useEffect } from 'react'
import Button from '../Button/Button.js'
import './Modal.css'

const Modal = ({ 
  isOpen = false,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  actions,
  className = '',
  ...props 
}) => {
  const modalClass = `
    modal 
    modal--${size}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={modalClass} {...props}>
        {(title || showCloseButton) && (
          <div className="modal__header">
            {title && <h2 className="modal__title">{title}</h2>}
            {showCloseButton && (
              <button 
                className="modal__close-button"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <svg 
                  className="modal__close-icon" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        <div className="modal__content">
          {children}
        </div>
        
        {actions && (
          <div className="modal__footer">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de confirmación
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false
}) => {
  const actions = (
    <div className="modal__actions">
      <Button 
        variant="secondary" 
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button 
        variant={variant} 
        onClick={onConfirm}
        loading={loading}
      >
        {confirmText}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      actions={actions}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <p className="modal__message">{message}</p>
    </Modal>
  )
}

export default Modal
