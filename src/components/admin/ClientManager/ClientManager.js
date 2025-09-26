import { useState } from 'react'
import { deleteClientRecord, updateClientRecord, assignCampaignsToClient } from '../../../services/supabase.js'
import { formatDateTime } from '../../../utils/dateHelpers.js'
import Button from '../../common/Button/Button.js'
import Table from '../../common/Table/Table.js'
import Select from '../../common/Select/Select.js'
import Modal, { ConfirmModal } from '../../common/Modal/Modal.js'
import './ClientManager.css'

const ClientManager = ({ clients, campaigns, onEditClient, onRefresh }) => {
  const [loading, setLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, client: null })
  const [error, setError] = useState('')

  const handleToggleStatus = async (client) => {
    try {
      setLoading(true)
      setError('')
      
      await updateClientRecord(client.id, { 
        is_active: !client.is_active 
      })
      
      onRefresh()
    } catch (err) {
      setError('Error al actualizar el estado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (client) => {
    setDeleteModal({ show: true, client })
  }

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      setError('')
      
      await deleteClientRecord(deleteModal.client.id)
      setDeleteModal({ show: false, client: null })
      onRefresh()
    } catch (err) {
      setError('Error al eliminar el cliente: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, client: null })
  }

  const handleCampaignAssignment = async (clientId, campaignId) => {
    try {
      setLoading(true)
      setError('')
      
      // Obtener campañas actuales del cliente
      const currentCampaigns = campaigns
        .filter(c => c.client_id === clientId)
        .map(c => c.id)
      
      let newCampaigns
      if (campaignId === '') {
        // Desasignar todas las campañas
        newCampaigns = []
      } else if (currentCampaigns.includes(campaignId)) {
        // Si ya está asignada, no hacer nada
        return
      } else {
        // Agregar la nueva campaña
        newCampaigns = [...currentCampaigns, campaignId]
      }
      
      await assignCampaignsToClient(clientId, newCampaigns)
      onRefresh()
    } catch (err) {
      setError('Error al asignar campaña: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCampaign = async (clientId, campaignId) => {
    try {
      setLoading(true)
      setError('')
      
      // Obtener campañas actuales del cliente y remover la especificada
      const currentCampaigns = campaigns
        .filter(c => c.client_id === clientId && c.id !== campaignId)
        .map(c => c.id)
      
      await assignCampaignsToClient(clientId, currentCampaigns)
      onRefresh()
    } catch (err) {
      setError('Error al remover campaña: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calcular campañas por cliente
  const getClientCampaigns = (clientId) => {
    return campaigns.filter(c => c.client_id === clientId)
  }

  const tableColumns = [
    {
      key: 'name',
      title: 'Nombre',
      render: (value, row) => (
        <div className="client-info">
          <div className="client-name">{value}</div>
          <div className="client-email">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Rol',
      align: 'center',
      render: (value) => (
        <span className={`role-badge role-badge--${value}`}>
          {value === 'admin' ? 'Admin' : 'Cliente'}
        </span>
      )
    },
    {
      key: 'campaigns_count',
      title: 'Campañas',
      render: (value, row) => {
        const clientCampaigns = getClientCampaigns(row.id)
        const availableCampaigns = campaigns.filter(c => !c.client_id || c.client_id === row.id)
        
        return (
          <div className="campaigns-cell">
            <div className="assigned-campaigns">
              {clientCampaigns.length === 0 ? (
                <span className="no-campaigns-text">Sin campañas</span>
              ) : (
                clientCampaigns.map(campaign => (
                  <div key={campaign.id} className="campaign-tag">
                    <span className="campaign-tag-name">{campaign.name}</span>
                    <button
                      className="campaign-remove-btn"
                      onClick={() => handleRemoveCampaign(row.id, campaign.id)}
                      disabled={loading}
                      title="Remover campaña"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="campaign-selector">
              <Select
                options={[
                  { value: '', label: 'Asignar campaña...' },
                  ...availableCampaigns
                    .filter(c => !c.client_id)
                    .map(campaign => ({
                      value: campaign.id,
                      label: campaign.name
                    }))
                ]}
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleCampaignAssignment(row.id, e.target.value)
                  }
                }}
                disabled={loading}
                className="campaign-select"
              />
            </div>
          </div>
        )
      }
    },
    {
      key: 'is_active',
      title: 'Estado',
      align: 'center',
      render: (value) => (
        <span className={`status-badge ${value ? 'status-badge--active' : 'status-badge--inactive'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Creado',
      align: 'center',
      render: (value) => formatDateTime(value)
    },
    {
      key: 'actions',
      title: 'Acciones',
      align: 'center',
      render: (value, row) => (
        <div className="table__actions">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEditClient(row)}
            disabled={loading}
          >
            Editar
          </Button>
          
          <Button
            variant={row.is_active ? 'warning' : 'success'}
            size="small"
            onClick={() => handleToggleStatus(row)}
            disabled={loading}
          >
            {row.is_active ? 'Desactivar' : 'Activar'}
          </Button>
          
          {row.role !== 'admin' && (
            <Button
              variant="danger"
              size="small"
              onClick={() => handleDeleteClick(row)}
              disabled={loading}
            >
              Eliminar
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="client-manager">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Table
        columns={tableColumns}
        data={clients}
        loading={loading}
        emptyMessage="No hay clientes registrados"
        striped={true}
        hoverable={true}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${deleteModal.client?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={loading}
      />
    </div>
  )
}

export default ClientManager
