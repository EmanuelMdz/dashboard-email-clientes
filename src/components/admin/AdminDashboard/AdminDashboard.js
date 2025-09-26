import { useState, useEffect } from 'react'
import { logout } from '../../../services/auth.js'
import { getClients, getCampaigns, createClientRecord, updateClientRecord, assignCampaignsToClient } from '../../../services/supabase.js'
import { testInstantlyConnection, syncCampaignsFromInstantly } from '../../../services/instantly.js'
import { exportClientsList } from '../../../utils/exportHelpers.js'
import BrandHeader from '../../common/Header/Header.js'
import Button from '../../common/Button/Button.js'
import Card from '../../common/Card/Card.js'
import Modal from '../../common/Modal/Modal.js'
import ClientManager from '../ClientManager/ClientManager.js'
import './AdminDashboard.css'

const AdminDashboard = ({ user }) => {
  const [clients, setClients] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [instantlyStatus, setInstantlyStatus] = useState(null)

  useEffect(() => {
    loadAdminData()
    checkInstantlyConnection()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [clientsData, campaignsData] = await Promise.all([
        getClients(),
        getCampaigns()
      ])
      
      setClients(clientsData)
      setCampaigns(campaignsData)
      
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message)
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkInstantlyConnection = async () => {
    try {
      const status = await testInstantlyConnection()
      setInstantlyStatus(status)
    } catch (err) {
      setInstantlyStatus({ success: false, message: 'Error de conexión' })
    }
  }

  const handleSyncCampaigns = async () => {
    try {
      setLoading(true)
      setError('')
      
      const result = await syncCampaignsFromInstantly()
      
      if (result.success) {
        // Recargar datos después de la sincronización
        await loadAdminData()
        setInstantlyStatus({ success: true, message: result.message })
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Error al sincronizar campañas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = () => {
    setSelectedClient(null)
    setShowClientModal(true)
  }

  const handleEditClient = (client) => {
    setSelectedClient(client)
    setShowClientModal(true)
  }

  const handleCloseModal = () => {
    setShowClientModal(false)
    setSelectedClient(null)
  }

  const handleClientSaved = () => {
    loadAdminData()
    handleCloseModal()
  }

  const handleExportClients = () => {
    try {
      exportClientsList(clients)
    } catch (err) {
      setError('Error al exportar: ' + err.message)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  // Calcular estadísticas
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.is_active).length,
    totalCampaigns: campaigns.length,
    campaignsWithoutClient: campaigns.filter(c => !c.client_id).length
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <BrandHeader
        title="Panel de Administración"
        subtitle={`Bienvenido, ${user.name}`}
        actions={(
          <>
            <Button
              variant="primary"
              onClick={handleCreateClient}
            >
              Nuevo Cliente
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </>
        )}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {error && (
            <Card variant="danger" className="error-card">
              {error}
            </Card>
          )}

          {loading ? (
            <div className="dashboard-loading">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              <div className="stats-grid">
                <Card className="stat-card">
                  <div className="stat-content">
                    <div className="stat-value">{stats.totalClients}</div>
                    <div className="stat-label">Total Clientes</div>
                  </div>
                </Card>

                <Card className="stat-card">
                  <div className="stat-content">
                    <div className="stat-value">{stats.activeClients}</div>
                    <div className="stat-label">Clientes Activos</div>
                  </div>
                </Card>

                <Card className="stat-card">
                  <div className="stat-content">
                    <div className="stat-value">{stats.totalCampaigns}</div>
                    <div className="stat-label">Total Campañas</div>
                  </div>
                </Card>

                <Card className="stat-card stat-card--warning">
                  <div className="stat-content">
                    <div className="stat-value">{stats.campaignsWithoutClient}</div>
                    <div className="stat-label">Sin Asignar</div>
                  </div>
                </Card>
              </div>

              {/* Gestión de Clientes */}
              <Card 
                title="Gestión de Clientes"
                actions={
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleExportClients}
                    disabled={clients.length === 0}
                  >
                    Exportar Lista
                  </Button>
                }
                className="clients-card"
              >
                <ClientManager
                  clients={clients}
                  campaigns={campaigns}
                  onEditClient={handleEditClient}
                  onRefresh={loadAdminData}
                />
              </Card>

              {/* Estado de Conexión - Movido al final */}
              <Card 
                title="Estado de Conexión" 
                variant={instantlyStatus?.success ? 'success' : 'danger'}
                className="status-card status-card--footer"
              >
                <div className="status-content status-content--compact">
                  <div className="status-indicator">
                    <div className={`status-dot ${instantlyStatus?.success ? 'status-dot--success' : 'status-dot--error'}`}></div>
                    <span className="status-text">
                      {instantlyStatus?.success ? 'Conectado a Instantly' : 'Error de conexión con Instantly'}
                    </span>
                  </div>
                  <p className="status-message">{instantlyStatus?.message}</p>
                  <div className="status-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={checkInstantlyConnection}
                    >
                      Verificar Conexión
                    </Button>
                    
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleSyncCampaigns}
                      loading={loading}
                    >
                      Sincronizar Campañas
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Modal de Cliente */}
      <Modal
        isOpen={showClientModal}
        onClose={handleCloseModal}
        title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="medium"
      >
        <ClientForm
          client={selectedClient}
          campaigns={campaigns}
          onSave={handleClientSaved}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

// Componente de formulario de cliente
const ClientForm = ({ client, campaigns, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    password: '',
    is_active: client?.is_active ?? true
  })
  const [selectedCampaigns, setSelectedCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar campañas asignadas al cliente (si es edición)
  useEffect(() => {
    if (client) {
      const clientCampaigns = campaigns
        .filter(campaign => campaign.client_id === client.id)
        .map(campaign => campaign.id)
      setSelectedCampaigns(clientCampaigns)
    }
  }, [client, campaigns])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      setError('Nombre y email son obligatorios')
      return
    }
    
    if (!client && !formData.password) {
      setError('La contraseña es obligatoria para nuevos clientes')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (client) {
        // Actualizar cliente existente
        const updates = {
          name: formData.name,
          email: formData.email,
          is_active: formData.is_active
        }
        
        // Solo actualizar contraseña si se proporcionó una nueva
        if (formData.password) {
          updates.password_hash = formData.password
        }
        
        await updateClientRecord(client.id, updates)
      } else {
        // Crear nuevo cliente
        const newClient = await createClientRecord({
          name: formData.name,
          email: formData.email,
          password_hash: formData.password,
          role: 'client',
          is_active: formData.is_active
        })
        
        // Asignar campañas al nuevo cliente
        if (selectedCampaigns.length > 0) {
          await assignCampaignsToClient(newClient.id, selectedCampaigns)
        }
      }
      
      // Si es edición, también actualizar asignación de campañas
      if (client) {
        await assignCampaignsToClient(client.id, selectedCampaigns)
      }
      
      onSave()
    } catch (err) {
      setError('Error al guardar el cliente: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="client-form">
      <div className="form-group">
        <label className="form-label">Nombre</label>
        <input
          type="text"
          className="form-input"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          {client ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
        </label>
        <input
          type="password"
          className="form-input"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required={!client}
        />
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
          />
          Cliente activo
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Campañas Asignadas</label>
        <div className="campaigns-list">
          {campaigns.length === 0 ? (
            <p className="no-campaigns">No hay campañas disponibles. Sincroniza primero las campañas de Instantly.</p>
          ) : (
            campaigns.map(campaign => (
              <label key={campaign.id} className="campaign-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCampaigns.includes(campaign.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCampaigns([...selectedCampaigns, campaign.id])
                    } else {
                      setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id))
                    }
                  }}
                />
                <span className="campaign-info">
                  <span className="campaign-name">{campaign.name}</span>
                  <span className="campaign-status">{campaign.status}</span>
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {client ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}

export default AdminDashboard
