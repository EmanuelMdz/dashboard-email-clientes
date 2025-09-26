# 🚀 Guía de Deployment en Vercel

## ⚠️ IMPORTANTE: Seguridad de Variables de Entorno

**NUNCA** subas el archivo `.env` con datos reales a GitHub. Usa `.env.example` como plantilla.

## 📋 Checklist Pre-Deployment

- [ ] ✅ Archivo `.env` removido del repositorio
- [ ] ✅ `.env.example` creado con plantilla
- [ ] ✅ `.gitignore` actualizado para excluir `.env`
- [ ] ✅ README.md completo
- [ ] ✅ `vercel.json` configurado

## 🔧 Pasos para Deployment

### 1. Preparar Repositorio
```bash
# Remover .env del repositorio (si ya se subió)
git rm --cached .env
git add .
git commit -m "Remove .env file and add deployment files"
git push origin main
```

### 2. Configurar Vercel

1. **Ir a [vercel.com](https://vercel.com)**
2. **Import Project** desde GitHub
3. **Seleccionar**: `EmanuelMdz/dashboard-email-clientes`

### 3. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ir a **Settings > Environment Variables** y agregar:

```
VITE_SUPABASE_URL=https://eisbdikbihpxabteevui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_INSTANTLY_API_KEY=ZmRmYzlkOGMtYjk1ZS00NDY0LWIwMTktZjQ1ZjFmNWNjZDY3...
VITE_API_BASE=https://tu-dominio.vercel.app
```

### 4. Deploy

Vercel detectará automáticamente:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

## 🔄 Deployment Automático

Cada push a `main` disparará un deployment automático.

## 🛠️ Troubleshooting

### Error: "Environment variables not found"
- Verificar que todas las variables estén configuradas en Vercel
- Asegurarse de que tengan el prefijo `VITE_`

### Error: "Build failed"
- Verificar que `package.json` tenga todos los scripts necesarios
- Revisar que no haya imports faltantes

### Error: "API endpoints not working"
- Verificar que `vercel.json` esté configurado correctamente
- Asegurarse de que las Vercel Functions estén en la carpeta `api/`

## 📞 Soporte

Si tienes problemas con el deployment, revisar:
1. Logs de Vercel Dashboard
2. Variables de entorno configuradas
3. Configuración de `vercel.json`
