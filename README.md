# Kamino API Gateway

Gateway API para microservicios desarrollado con Nest.js siguiendo arquitectura hexagonal.

## Características

- **Arquitectura Hexagonal**: Separación clara entre dominio e infraestructura
- **Validación JWT**: Autenticación segura para todas las peticiones
- **Rate Limiting**: Protección contra ataques DoS
- **CORS Configurado**: Acceso restringido solo para aplicación Flutter
- **Enrutamiento Inteligente**: Redirección automática a microservicios
- **Logging Completo**: Registro detallado de todas las peticiones
- **Monitoreo**: Endpoints de salud y estado

## Configuración

### Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Microservices URLs
USERS_SERVICE_URL=http://localhost:3001
PLACES_SERVICE_URL=http://localhost:3002
ROUTES_SERVICE_URL=http://localhost:3003
NARRATOR_SERVICE_URL=http://localhost:3004

# CORS Configuration
FLUTTER_APP_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

## Instalación

```bash
# Instalar dependencias
pnpm install

# Compilar el proyecto
pnpm run build

# Ejecutar en desarrollo
pnpm run start:dev

# Ejecutar en producción
pnpm run start:prod
```

## Arquitectura

### Estructura de Carpetas

```
src/
├── domain/                 # Capa de dominio
│   ├── entities/          # Entidades del dominio
│   ├── ports/             # Puertos (interfaces)
│   └── services/          # Servicios del dominio
└── infrastructure/        # Capa de infraestructura
    ├── adapters/          # Adaptadores
    ├── controllers/       # Controladores HTTP
    ├── guards/            # Guards de seguridad
    └── middleware/        # Middleware
```

### Flujo de Petición

```
Flutter App → Gateway API → Validación JWT → Rate Limiting → Enrutamiento → Microservicio → Respuesta
```

## Enrutamiento

El gateway redirige las peticiones según las siguientes rutas:

- `/api/auth/*` → Servicio de Usuarios (puerto 3001)
- `/api/places/*` → Servicio de Lugares (puerto 3002)
- `/api/routes/*` → Servicio de Rutas (puerto 3003)
- `/api/narrator/*` → Servicio Narrador (puerto 3004)

## Endpoints

### Información del Gateway
- `GET /` - Información básica del gateway

### Monitoreo
- `GET /health` - Estado de salud del sistema
- `GET /health/ready` - Estado de preparación del sistema

### API Gateway
- `ALL /api/*` - Todas las peticiones API son procesadas aquí

## Seguridad

### JWT
Todas las peticiones a `/api/*` requieren un token JWT válido en el header:
```
Authorization: Bearer <token>
```

### Rate Limiting
- Límite por defecto: 100 peticiones por minuto
- Configurable via variables de entorno

### CORS
- Configurado para permitir solo el origen de la aplicación Flutter
- Headers permitidos: `Content-Type`, `Authorization`, `X-Requested-With`

## Logging

El sistema registra:
- Todas las peticiones entrantes
- Respuestas con códigos de estado
- Tiempo de respuesta
- Errores y excepciones
- IP del cliente y User-Agent

## Desarrollo

### Agregar Nuevo Microservicio

1. Actualizar `RequestEntity.getServiceRoute()` para incluir la nueva ruta
2. Agregar la URL del servicio en `GatewayService.getServiceUrl()`
3. Configurar la variable de entorno correspondiente

### Personalizar Autenticación

Modificar `JwtAuthAdapter` para cambiar la lógica de validación JWT.

### Personalizar Logging

Modificar `WinstonLoggerAdapter` para cambiar el formato o destino de los logs.

## Tecnologías

- **Nest.js**: Framework principal
- **TypeScript**: Lenguaje de programación
- **JWT**: Autenticación
- **Axios**: Cliente HTTP para enrutamiento
- **Throttler**: Rate limiting
- **Express**: Servidor HTTP subyacente

## Licencia

UNLICENSED
