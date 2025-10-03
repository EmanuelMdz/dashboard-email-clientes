# Estructura del Proyecto - Dashboard Email Clientes

## Información General

- **Nombre:** Dashboard Email Clientes Ainnovate
- **Versión:** 0.0.0
- **Framework Principal:** React 19.1.1 + Vite 7.1.7
- **Tipo:** Aplicación SPA (Single Page Application)

---

## Estructura de Directorios

```
/dashboard-emal-clientes-ainnovate
├── /api                          # Serverless functions (Vercel)
│   ├── campaigns.js              # Endpoint para obtener campañas desde Supabase
│   ├── login.js                  # Endpoint de autenticación
│   └── /instantly                # Endpoints para Instantly API (deprecated)
│       ├── analytics.js
│       ├── campaign.js
│       └── campaigns.js
│
├── /docs                         # Documentación
│   └── instantly-metrics.md     # Documentación de métricas de Instantly
│
├── /public                       # Assets estáticos
│   ├── cuadrado_blue_transparente.png
│   ├── horizontal_blue_transparente.png
│   ├── favico.ico
│   └── vite.svg
│
├── /src                          # Código fuente principal
│   ├── /assets                   # Assets de React
│   │   └── react.svg
│   │
│   ├── /components               # Componentes React
│   │   ├── /admin                # Componentes de administrador
│   │   │   ├── /AdminDashboard
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   └── AdminDashboard.css
│   │   │   └── /ClientManager
│   │   │       ├── ClientManager.js
│   │   │       └── ClientManager.css
│   │   │
│   │   ├── /client               # Componentes de cliente
│   │   │   ├── /CampaignMetrics
│   │   │   │   ├── CampaignMetrics.js
│   │   │   │   └── CampaignMetrics.css
│   │   │   ├── /ClientDashboard
│   │   │   │   ├── ClientDashboard.js
│   │   │   │   └── ClientDashboard.css
│   │   │   └── /InterestStats
│   │   │       ├── InterestStats.js
│   │   │       └── InterestStats.css
│   │   │
│   │   └── /common               # Componentes reutilizables
│   │       ├── /Button
│   │       ├── /Card
│   │       ├── /Chart
│   │       ├── /DatePicker
│   │       ├── /Header
│   │       ├── /Modal
│   │       ├── /Select
│   │       └── /Table
│   │
│   ├── /pages                    # Páginas principales
│   │   ├── /Dashboard
│   │   │   ├── Dashboard.js
│   │   │   └── Dashboard.css
│   │   └── /Login
│   │       ├── Login.js
│   │       └── Login.css
│   │
│   ├── /services                 # Servicios y API clients
│   │   ├── auth.js               # Servicio de autenticación
│   │   ├── supabase.js          # Cliente de Supabase
│   │   └── instantly.js         # Cliente de Instantly/n8n
│   │
│   ├── /utils                    # Utilidades
│   │   ├── dateHelpers.js       # Helpers para manejo de fechas
│   │   └── exportHelpers.js     # Helpers para exportación CSV
│   │
│   ├── App.jsx                   # Componente principal
│   ├── App.css                   # Estilos globales de App
│   ├── main.jsx                  # Punto de entrada
│   └── index.css                 # Estilos globales
│
├── .env                          # Variables de entorno (NO DEBE ESTAR EN GIT)
├── .env.example                  # Plantilla de variables de entorno
├── .gitignore                    # Archivos ignorados por Git
├── eslint.config.js              # Configuración de ESLint
├── index.html                    # HTML principal
├── package.json                  # Dependencias y scripts
├── server-dev.js                 # Servidor de desarrollo local
├── setup.sql                     # Script SQL para base de datos
├── test-instantly.js             # Script de pruebas de Instantly API
├── vercel.json                   # Configuración de Vercel
└── vite.config.js                # Configuración de Vite
```

---

## Inventario de Archivos Principales

### Puntos de Entrada

- **`index.html`**: HTML principal de la aplicación
- **`src/main.jsx`**: Punto de entrada JavaScript que monta React
- **`src/App.jsx`**: Componente raíz con enrutamiento

### Servicios Core

#### `src/services/auth.js`
- **Propósito**: Gestión de autenticación y sesiones
- **Funciones principales**:
  - `login()`: Autenticación de usuarios
  - `logout()`: Cierre de sesión
  - `getCurrentUser()`: Obtener usuario actual
  - `useAuth()`: Hook de React para autenticación
- **Almacenamiento**: LocalStorage (`dashboard_session`)

#### `src/services/supabase.js`
- **Propósito**: Cliente de Supabase y operaciones de base de datos
- **Funciones principales**:
  - Gestión de clientes (CRUD)
  - Gestión de campañas (CRUD)
  - Asignación de campañas a clientes
  - Métricas de campaña
- **Tablas utilizadas**: `clients`, `campaigns`, `campaign_metrics`

#### `src/services/instantly.js`
- **Propósito**: Integración con Instantly API y webhooks n8n
- **Funciones principales**:
  - `listCampaigns()`: Obtener campañas desde n8n
  - `getRealTimeMetrics()`: Métricas en tiempo real
  - `getInterestStats()`: Estadísticas de interés
  - `syncCampaignsFromInstantly()`: Sincronización de campañas
- **Endpoints utilizados**:
  - n8n: `https://ssn8nwebhookss.ainnovateagency.com/webhook/*`

### Componentes de Páginas

#### Admin Dashboard (`src/components/admin/AdminDashboard/`)
- Vista principal para administradores
- Gestión de clientes
- Sincronización de campañas desde Instantly
- Estadísticas generales

#### Client Dashboard (`src/components/client/ClientDashboard/`)
- Vista principal para clientes
- Visualización de métricas de campañas asignadas
- Filtros por fecha y campaña
- Exportación de datos

### Utilidades

#### `src/utils/dateHelpers.js`
- Formateo de fechas
- Cálculo de rangos de fechas
- Generación de arrays de fechas
- Funciones: 15 helpers de fechas

#### `src/utils/exportHelpers.js`
- Exportación a CSV
- Conversión de datos
- Funciones de descarga
- Validación de datos

---

## Arquitectura de la Aplicación

### Flujo de Datos

```
Usuario → Login → Auth Service → Supabase
                                     ↓
                              Dashboard Router
                                     ↓
                          ┌──────────┴──────────┐
                          ↓                     ↓
                   Admin Dashboard      Client Dashboard
                          ↓                     ↓
                  Client Manager        Campaign Metrics
                          ↓                     ↓
                    Supabase DB          n8n Webhooks
```

### Patrones de Diseño

1. **Componentes Funcionales con Hooks**: Todo React usa hooks (useState, useEffect, useMemo)
2. **Separación de Responsabilidades**: Services, Components, Utils, Pages
3. **Componentes Reutilizables**: Sistema de diseño en `/common`
4. **Custom Hooks**: `useAuth()` para autenticación
5. **Protected Routes**: HOC para rutas protegidas
6. **Service Layer**: Abstracción de APIs externas

### Estado y Gestión de Datos

- **Estado Local**: React useState para estado de componentes
- **Estado de Sesión**: LocalStorage para persistencia
- **Caché**: Cache simple en memoria para campañas (30s)
- **No usa Redux/Context**: Estado local únicamente

---

## Tecnologías y Frameworks

### Frontend
- **React**: 19.1.1
- **React Router**: 6.20.1 (enrutamiento)
- **Chart.js**: 4.5.0 (gráficos)
- **React ChartJS 2**: 5.2.0 (wrapper de Chart.js)

### Backend/Database
- **Supabase**: Cliente JS 2.58.0
- **PostgreSQL**: A través de Supabase

### Build Tools
- **Vite**: 7.1.7 (bundler y dev server)
- **ESLint**: 9.36.0 (linting)

### Deployment
- **Vercel**: Serverless functions y hosting
- **Express**: 5.1.0 (servidor de desarrollo local)

### Utilidades
- **date-fns**: 2.30.0 (manejo de fechas)
- **CORS**: 2.8.5 (desarrollo local)
- **dotenv**: 17.2.2 (variables de entorno)

---

## Convenciones de Código

### Nomenclatura

1. **Archivos de Componentes**:
   - PascalCase para componentes: `Button.js`, `AdminDashboard.js`
   - CSS con mismo nombre: `Button.css`, `AdminDashboard.css`

2. **Funciones y Variables**:
   - camelCase: `handleSubmit`, `loadMetrics`, `selectedCampaign`

3. **Constantes**:
   - UPPER_SNAKE_CASE: `API_KEY`, `CACHE_DURATION`

4. **Servicios**:
   - camelCase con verbo: `getClients`, `createCampaign`, `deleteUser`

### Estructura de Archivos

```javascript
// Orden estándar en archivos JS:
// 1. Imports
import React, { useState } from 'react'
import Service from './service.js'

// 2. Constantes
const DEFAULT_VALUE = 'value'

// 3. Componente principal
const Component = ({ props }) => {
  // 3.1 Hooks
  const [state, setState] = useState()
  
  // 3.2 Funciones
  const handleAction = () => {}
  
  // 3.3 Render
  return <div>...</div>
}

// 4. Export
export default Component
```

### Estilos CSS

- **BEM Naming**: `.component__element--modifier`
- **Archivos separados**: Cada componente tiene su CSS
- **Variables CSS**: Uso de custom properties
- **Mobile-first**: Responsive design

---

## Documentación de APIs y Servicios

### Variables de Entorno Necesarias

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (solo backend)

# Instantly
VITE_INSTANTLY_API_KEY=base64_encoded_key

# Desarrollo
VITE_API_BASE=http://localhost:3001

# Producción
VITE_API_BASE=https://your-domain.vercel.app
```

### Endpoints Principales

#### Supabase (PostgreSQL)
- **Base URL**: Definida en `VITE_SUPABASE_URL`
- **Tablas**:
  - `clients`: Usuarios del sistema
  - `campaigns`: Campañas de email
  - `campaign_metrics`: Métricas diarias

#### n8n Webhooks
- **Base URL**: `https://ssn8nwebhookss.ainnovateagency.com/webhook/`
- **Endpoints**:
  - `GET /get-campaigns`: Lista de campañas
  - `GET /get-data-daily-campaign`: Métricas diarias
  - `GET /get-interest`: Estadísticas de interés

#### Instantly API (Deprecated - Se usa n8n)
- **Base URL**: `https://api.instantly.ai/api/v2/`
- **Endpoints**:
  - `GET /campaigns`: Lista de campañas
  - `GET /campaigns/analytics/daily`: Analytics diarios
  - `GET /campaigns/analytics/overview`: Resumen

### Servicios Externos

1. **Supabase**
   - Autenticación y base de datos
   - Row Level Security (RLS) configurado

2. **n8n**
   - Webhooks para datos en tiempo real
   - Proxy para Instantly API

3. **Instantly**
   - Plataforma de email marketing
   - Fuente original de datos

---

## Base de Datos (Supabase/PostgreSQL)

### Esquema Principal

#### Tabla: `clients`
```sql
- id (uuid, PK)
- email (text, unique)
- name (text)
- password_hash (text)
- role (text) -- 'admin' | 'client'
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla: `campaigns`
```sql
- id (uuid, PK)
- instantly_campaign_id (text, unique)
- name (text)
- status (text)
- client_id (uuid, FK → clients.id)
- created_at (timestamp)
- last_synced (timestamp)
```

#### Tabla: `campaign_metrics`
```sql
- id (uuid, PK)
- campaign_id (uuid, FK → campaigns.id)
- date (date)
- messages_sent (integer)
- replies_received (integer)
- unique_replies (integer)
- created_at (timestamp)
- UNIQUE(campaign_id, date)
```

---

## Scripts Disponibles

```json
{
  "dev": "vite",                    // Inicia dev server
  "build": "vite build",            // Build para producción
  "lint": "eslint .",               // Ejecuta linter
  "preview": "vite preview"         // Preview del build
}
```

### Scripts Adicionales

- **`server-dev.js`**: Servidor Express local para desarrollo
  ```bash
  node server-dev.js
  ```

- **`test-instantly.js`**: Test de conexión con Instantly API
  ```bash
  node test-instantly.js
  ```

---

## Deployment (Vercel)

### Configuración (`vercel.json`)

```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build Steps

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Deploy: Automático con Git push a main

### Variables de Entorno en Vercel

Todas las variables `VITE_*` y `SUPABASE_SERVICE_ROLE_KEY` deben configurarse en:
**Vercel Dashboard → Settings → Environment Variables**

---

## Notas Importantes

### Seguridad

⚠️ **ADVERTENCIA**: Este proyecto tiene vulnerabilidades de seguridad identificadas en el AUDIT_REPORT.md

### Performance

- Caché de campañas: 30 segundos
- Lazy loading: No implementado
- Code splitting: Por defecto de Vite

### Compatibilidad

- Navegadores modernos (ES2020+)
- React 19 features
- Node.js 20.x para serverless functions
