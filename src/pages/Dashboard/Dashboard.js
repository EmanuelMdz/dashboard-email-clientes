import { useAuth } from '../../services/auth.js'
import ClientDashboard from '../../components/client/ClientDashboard/ClientDashboard.js'
import AdminDashboard from '../../components/admin/AdminDashboard/AdminDashboard.js'
import './Dashboard.css'

const Dashboard = () => {
  const { user, isAdmin, isClient } = useAuth()

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {isAdmin && <AdminDashboard user={user} />}
      {isClient && <ClientDashboard user={user} />}
    </div>
  )
}

export default Dashboard
