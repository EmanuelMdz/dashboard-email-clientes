{{# Dashboard Email Clientes - Ainnovate

Dashboard para gestionar campañas de email marketing conectado con Instantly API, diseñado para la agencia Ainnovate.

## Características

- **Dashboard de Cliente**: Visualización de métricas de campañas en tiempo real
- **Panel de Administración**: Gestión de clientes y asignación de campañas
- **Integración con Instantly**: Sincronización automática de campañas y métricas
- **Autenticación Supabase**: Sistema de login seguro con roles
- **Gráficos Interactivos**: Charts con gradientes y watermarks de marca
- **Diseño Responsive**: Optimizado para desktop y móvil
- **Branding Ainnovate**: Colores y logos corporativos integrados

## Stack Tecnológico

- **Frontend**: React + Vite
- **Backend**: Vercel Functions / API Routes
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Gráficos**: Chart.js + react-chartjs-2
- **Hosting**: Vercel + GitHub
- **API Externa**: Instantly (vía n8n webhooks)

## Requisitos Previos

- Node.js 18+
- Cuenta de Supabase
- API Key de Instantly
- Cuenta de Vercel (para deployment)

## Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/EmanuelMdz/dashboard-email-clientes.git
cd dashboard-email-clientes
```

2. **Instalar dependencias**
```bash
npm install

3. **Configurar variables de entorno**
Crear archivo `.env` con:
```env
VITE_SUPABASE_URL=https://eisbdikbihpxabteevui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2JkaWtiaWhweGFidGVldnVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwODczMSwiZXhwIjoyMDc0NDg0NzMxfQ.hanR10q2bp86pfqLu7C5GyiA69eIaKyMLhVJzEJFdn0
INSTANTLY_API_KEY=ZmRmYzlkOGMtYjk1ZS00NDY0LWIwMTktZjQ1ZjFmNWNjZDY3OkhFaXd4UlpsckN0Rg==
```

4. **Configurar base de datos**
Ejecutar las siguientes consultas SQL en Supabase:

```sql
-- Tabla de clientes
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at timestamp DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Tabla de campañas
CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instantly_campaign_id text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp DEFAULT now(),
  last_synced timestamp DEFAULT now()
);

-- Tabla de métricas diarias
CREATE TABLE campaign_metrics (
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
VALUES ('Administrador', 'admin@ainnovate.com', 'admin123', 'admin');
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

## Uso

### Credenciales por defecto
- **Admin**: admin@ainnovate.com / admin123
- Los clientes son creados por el administrador

### Estructura del proyecto

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   ├── client/          # Componentes del panel cliente
│   └── admin/           # Componentes del panel admin
├── pages/               # Páginas principales
├── services/            # Servicios (API, auth, etc.)
└── utils/               # Utilidades y helpers
```

### Principios de desarrollo

- **Simplicidad**: Cada componente tiene su propio archivo .js y .css
- **Separación**: NO mezclar CSS dentro del JS
- **Modularidad**: Componentes reutilizables y funcion separadas
- **Mantenibilidad**: Estructura clara y fácil de mantener

## Scripts disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run lint` - Linter de código

## Integración con Instantly

El dashboard se conecta con los siguientes endpoints de Instantly:
- `/api/v2/campaign/listcampaign` - Listar campañas
- `/api/v2/campaign/getcampaign` - Detalle de campaña
- `/api/v2/analytics/getcampaignanalytics` - Analytics de campaña
- `/api/v2/analytics/getcampaignsummary` - Resumen de campaña
- `/api/v2/lead/listleads` - Leads por campaña

## Deployment

El proyecto está configurado para deployment en Vercel:

1. Conectar repositorio con Vercel
2. Configurar variables de entorno en Vercel
3. Deploy automático en cada push a main

## Soporte

Para soporte técnico o preguntas sobre el proyecto, contactar al equipo de desarrollo.
