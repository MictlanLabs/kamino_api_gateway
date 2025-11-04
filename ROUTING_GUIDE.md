# Guía de Enrutamiento del Gateway Kamino API

## Resumen de Enrutamiento Simplificado

El gateway ahora utiliza un enrutamiento consistente y simplificado para todos los microservicios.

## URLs Base de Microservicios

```env
USERS_SERVICE_URL=https://kaminoapiuserservice-production.up.railway.app
PLACES_SERVICE_URL=https://kaminoapiplacesservice-production.up.railway.app
ROUTES_SERVICE_URL=http://localhost:3003
NARRATOR_SERVICE_URL=http://localhost:3004
```

## Mapeo de Rutas

### Microservicio de Usuarios
- **Gateway:** `https://kaminoapigateway-production.up.railway.app/api/auth/*`
- **Destino:** `${USERS_SERVICE_URL}/api/auth/*`

### Microservicio de Places (Lugares)
- **Gateway:** `https://kaminoapigateway-production.up.railway.app/api/places/*`
- **Destino:** `${PLACES_SERVICE_URL}/api/v1/places/*`

### Microservicio de Rutas
- **Gateway:** `https://kaminoapigateway-production.up.railway.app/api/routes/*`
- **Destino:** `${ROUTES_SERVICE_URL}/api/v1/routes/*`

### Microservicio de Narrador
- **Gateway:** `https://kaminoapigateway-production.up.railway.app/api/narrator/*`
- **Destino:** `${NARRATOR_SERVICE_URL}/api/v1/narrator/*`

## Ejemplos de Uso

### Places Service

```bash
# Obtener todos los lugares
GET https://kaminoapigateway-production.up.railway.app/api/places
# Se reenvía a: https://kaminoapiplacesservice-production.up.railway.app/api/v1/places

# Obtener lugar específico
GET https://kaminoapigateway-production.up.railway.app/api/places/123
# Se reenvía a: https://kaminoapiplacesservice-production.up.railway.app/api/v1/places/123

# Crear lugar
POST https://kaminoapigateway-production.up.railway.app/api/places
# Se reenvía a: https://kaminoapiplacesservice-production.up.railway.app/api/v1/places
```

### Users Service

```bash
# Registrar usuario
POST https://kaminoapigateway-production.up.railway.app/api/auth/register
# Se reenvía a: https://kaminoapiuserservice-production.up.railway.app/api/auth/register

# Iniciar sesión
POST https://kaminoapigateway-production.up.railway.app/api/auth/login
# Se reenvía a: https://kaminoapiuserservice-production.up.railway.app/api/auth/login
```

## Configuración de Variables de Entorno

Para Railway, usa estas variables:

```env
PORT="3000"
JWT_SECRET="dev-temp-secret"
AUTH_DISABLED="true"
RATE_LIMIT_TTL="60"
RATE_LIMIT_MAX="100"
LOG_LEVEL="info"
FLUTTER_APP_ORIGIN="https://url-de-tu-app-flutter.com"

# URLs de microservicios
PLACES_SERVICE_URL="https://kaminoapiplacesservice-production.up.railway.app"
USERS_SERVICE_URL="https://kaminoapiuserservice-production.up.railway.app"
ROUTES_SERVICE_URL="http://localhost:3003"
NARRATOR_SERVICE_URL="http://localhost:3004"
```

## Notas Importantes

1. **HTTPS obligatorio:** Railway requiere HTTPS para todos los servicios en producción
2. **Autenticación:** Con `AUTH_DISABLED=true` puedes probar sin tokens
3. **Logging:** El gateway muestra las URLs completas en los logs para facilitar el debugging

## Debugging

Si encuentras problemas, revisa los logs del gateway. Verás mensajes como:

```
[GatewayService] Routing request: GET /api/places -> places service -> https://kaminoapiplacesservice-production.up.railway.app/api/v1/places
```

Esto te permite ver exactamente a qué URL se está reenviando la petición.