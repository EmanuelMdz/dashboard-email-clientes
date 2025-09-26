# Instantly Metrics – Flujo en Tiempo Real y Manejo de Fechas

Este documento describe cómo el dashboard obtiene y muestra las métricas diarias de campañas de Instantly en tiempo real, cómo se manejan las fechas y zonas horarias, y qué componentes/servicios intervienen.

## Resumen del flujo
- **Fuente de verdad del ID de campaña**: columna `instantly_campaign_id` en Supabase.
- **Llamadas a la API**: se realizan a webhooks de n8n con CORS configurado.
- **Persistencia**: no se guardan métricas en Supabase; el dashboard las obtiene en tiempo real en cada carga.
- **Render**: el gráfico siempre muestra el rango completo seleccionado (p. ej., 7 o 30 días) rellenando días vacíos con 0.
- **Corrección de zona horaria**: las fechas diarias que responde Instantly pueden estar desplazadas 1 día; se ajustan para que la UI muestre el día correcto (local).

## Variables de entorno relevantes
En `.env` (o variables de entorno del proyecto):

- `VITE_N8N_GET_DAILY_URL` – Webhook n8n para analytics diarios, ej.:
  - `https://ssn8nwebhookss.ainnovateagency.com/webhook/get-data-daily-campaign`
- `VITE_N8N_GET_CAMPAIGNS_URL` – Webhook n8n para listar campañas (opcional; se usa en Admin para test/sync).

## Servicio: `src/services/instantly.js`
Funciones principales:

- **`getRealTimeMetrics(campaignId, instantlyCampaignId, startDate, endDate)`**
  - Thin wrapper que delega en `syncCampaignMetrics` y no persiste datos.

- **`syncCampaignMetrics(campaignId, instantlyCampaignId, startDate, endDate)`**
  - Valida que `startDate` y `endDate` vengan del selector.
  - Construye la URL al webhook de n8n (`VITE_N8N_GET_DAILY_URL`).
  - Para compensar el desfase de la API de Instantly, realiza la llamada con:
    - `start_date = UI_start - 1 día`
    - `end_date = UI_end`
  - Normaliza la respuesta (acepta `body`, `data`, `result` o array directo).
  - Ajusta cada fecha devuelta por la API desplazándola **+1 día** para mostrarla acorde al huso local.
  - Filtra los resultados al rango de la UI (tras el ajuste) y retorna un array de objetos tipo:
    ```json
    {
      "campaign_id": "<uuid-db>",
      "date": "YYYY-MM-DD",
      "messages_sent": <number>,
      "replies_received": <number>
    }
    ```

Helpers clave en el mismo archivo:
- `shiftDailyDateForDisplay(dateStr)` – suma 1 día a la fecha de la API (corrige la etiqueta del bucket diario de Instantly).
- `shiftDateStr(dateStr, deltaDays)` – desplaza cadenas `YYYY-MM-DD` N días (positivo/negativo).
- `listCampaigns()` – consulta a n8n y cachea 30s (utilizada por Admin para tests/sync; no usada en el dashboard de cliente).

## Utilidades de fecha: `src/utils/dateHelpers.js`
Ajustes para operar siempre en **horario local** (evitar desfases UTC) y generar rangos inclusivos:

- `formatDateForInput(date)` – devuelve `YYYY-MM-DD` usando `getFullYear()/getMonth()/getDate()` (local).
- `formatDate(date)` – si recibe `YYYY-MM-DD`, lo parsea como **fecha local** antes de formatear (evita off-by-one en labels).
- `getDateRange(range)` – rangos inclusivos:
  - `today`: hoy → hoy
  - `yesterday`: ayer → ayer
  - `last7days`: hoy y los 6 anteriores
  - `last30days`: hoy y los 29 anteriores
  - `thisMonth`: desde el día 1 hasta hoy
  - `lastMonth`: 1er día del mes anterior → último día del mes anterior
- `getDatesBetween(startDate, endDate)` – genera todas las fechas entre `startDate` y `endDate` en local (incluye ambos extremos).

## Render del gráfico: `src/components/client/CampaignMetrics/CampaignMetrics.js`
- Se construye el eje X con `getDatesBetween(startDate, endDate)` para **mostrar siempre el rango completo**.
- Se agrega por fecha el total de:
  - `Mensajes Enviados`
  - `Respuestas Recibidas`
- Días sin actividad se rellenan con **0** para ambas series.
- El gráfico se muestra siempre (aunque todos los valores sean 0).

## Componente del Dashboard: `src/components/client/ClientDashboard/ClientDashboard.js`
- Obtiene campañas del cliente desde Supabase (cada campaña tiene `instantly_campaign_id`).
- En `loadMetrics()` hace, por cada campaña del filtro seleccionado:
  - `getRealTimeMetrics(campaign.id, campaign.instantly_campaign_id, dateRange.startDate, dateRange.endDate)`
- Concurrency guard: evita ejecuciones paralelas de `loadMetrics`.
- Mensajería de errores: **no** muestra error si no hay datos; únicamente ante excepciones.

## Admin: `src/components/admin/AdminDashboard/AdminDashboard.js`
- `testInstantlyConnection()` – usa `listCampaigns()` para verificar que n8n/Instantly responde.
- `syncCampaignsFromInstantly()` – opcionaI, permite sincronizar/actualizar campañas base (id, name, status) desde Instantly.

## Consideraciones de zona horaria (muy importante)
- Instantly etiqueta los buckets diarios con una fecha que puede corresponder al día **anterior** según la zona.
- Ejemplo real: el 26/09 (hoy) el endpoint devuelve un registro con `date = 2025-09-25` y `sent = 56`.
- Solución aplicada:
  1) Llamamos a n8n con `start = UI_start - 1 día`, `end = UI_end`.
  2) Ajustamos cada `date` devuelta sumando **+1 día** antes de mostrarla.
  3) Filtramos al rango de la UI tras el ajuste, para no mostrar días fuera.

Con esto, el gráfico y la tabla muestran el día **correcto** para el usuario final (zona local) y permiten ver actividades de "hoy" dentro del rango seleccionado.

## Ejemplos de rango
- **Hoy** (26/09):
  - Llamada a n8n: `start=25/09`, `end=26/09`.
  - Si la API trae `{ date: '2025-09-25', sent: 56 }`, tras el ajuste se muestra como `2025-09-26`.
- **Ayer** (25/09):
  - Llamada a n8n: `start=24/09`, `end=25/09`.
  - Se mostrará solo el día 25/09 (si hubo actividad).
- **Últimos 7/30 días**:
  - El último tick del eje X es **hoy** y siempre se ven 7/30 puntos (con ceros donde no hubo actividad).

## Troubleshooting rápido
- **No se muestran datos pero la campaña tuvo actividad hoy**:
  - Verificar en consola: `API range used: ... | UI range: ...`.
  - Confirmar que la API devolvió entradas con `date` del día anterior y que se ajustaron a +1 en la UI.
- **Labels del eje X fuera de fecha**:
  - Asegurarse de que `formatDate()` y `formatDateForInput()` son las versiones locales (sin `toISOString()`).
- **CORS**:
  - Confirmar CORS permitido en n8n para el dominio actual.

## Extensiones futuras
- **Tabla con días vacíos**: opcional, completar la tabla de "Detalle por Día" con filas en cero.
- **Densidad de labels**: reducir ticks en el eje X en rangos muy largos sin perder los puntos.
- **Toggle de logs**: opcional, controlar verbosidad con `VITE_DEBUG`.

## Decisiones clave (para mantener simple)
- No hay matching por nombre. Siempre se usa `instantly_campaign_id` de Supabase.
- Métricas en tiempo real; no se persisten en DB.
- n8n es el único puente hacia Instantly desde el frontend.
