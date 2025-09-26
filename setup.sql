-- Script de configuración de base de datos para Dashboard de Campañas
-- Ejecutar en Supabase SQL Editor

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at timestamp DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Tabla de campañas
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instantly_campaign_id text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp DEFAULT now(),
  last_synced timestamp DEFAULT now()
);

-- Tabla de métricas diarias
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  date date NOT NULL,
  messages_sent integer DEFAULT 0,
  replies_received integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Insertar usuario administrador por defecto
INSERT INTO clients (name, email, password_hash, role) 
VALUES ('Administrador', 'admin@ainnovate.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON campaign_metrics(date);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas (opcional - ajustar según necesidades)
-- Los clientes solo pueden ver sus propios datos
CREATE POLICY "clients_select_own" ON clients
  FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');

CREATE POLICY "campaigns_select_own" ON campaigns
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE auth.uid()::text = id::text OR role = 'admin'
    )
  );

CREATE POLICY "metrics_select_own" ON campaign_metrics
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN clients cl ON c.client_id = cl.id
      WHERE auth.uid()::text = cl.id::text OR cl.role = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE clients IS 'Tabla de usuarios del sistema (clientes y administradores)';
COMMENT ON TABLE campaigns IS 'Tabla de campañas de email marketing de Instantly';
COMMENT ON TABLE campaign_metrics IS 'Métricas diarias de las campañas';

COMMENT ON COLUMN clients.password_hash IS 'Contraseña en texto plano (simplificado para demo)';
COMMENT ON COLUMN campaigns.instantly_campaign_id IS 'ID de la campaña en Instantly';
COMMENT ON COLUMN campaign_metrics.messages_sent IS 'Número de mensajes enviados en el día';
COMMENT ON COLUMN campaign_metrics.replies_received IS 'Número de respuestas recibidas en el día';
