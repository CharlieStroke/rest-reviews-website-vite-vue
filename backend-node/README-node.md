# Anáhuac Eats — Backend Node

API REST construida con **TypeScript**, **Express** y **Clean Architecture**. Orquesta autenticación, reseñas, establecimientos, almacenamiento y métricas.

---

## Stack

| Tecnología | Uso |
|---|---|
| Node.js 20+ / TypeScript | Runtime + tipado |
| Express | Framework HTTP |
| Prisma | ORM type-safe → Supabase PostgreSQL |
| tsyringe | Inyección de dependencias |
| Zod | Validación de esquemas |
| JWT + Argon2id | Autenticación + hashing |
| Helmet + CORS | Seguridad HTTP |
| Pino | Logging estructurado (JSON) |
| Swagger UI | Documentación (solo en desarrollo) |
| node-cron | Tareas programadas |
| Vitest | Tests unitarios |

---

## Arquitectura — Clean Architecture

```
src/
├── domain/
│   ├── entities/          # Establishment, Review, User, MetricsSnapshot
│   └── repositories/      # Interfaces (IReviewRepository, etc.)
├── application/
│   ├── use-cases/         # Un archivo por caso de uso
│   └── dtos/              # Zod schemas + tipos inferidos
└── infrastructure/
    ├── database/          # PrismaXxxRepository (implementaciones)
    ├── services/          # AnalyticsService, SupabaseStorageService
    ├── config/            # env.config, container.ts (DI), logger, swagger
    └── http/
        ├── controllers/   # Un controller por entidad
        ├── routes/        # auth, review, establishment, user, metrics, upload, notification
        └── middlewares/   # AuthMiddleware, RateLimitMiddleware, ErrorMiddleware
```

**Inyección de dependencias:** `tsyringe` con tokens registrados en `infrastructure/config/container.ts`.

---

## Variables de entorno

Crea `backend-node/.env` desde `backend-node/.env.example`:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión Supabase (pooler en producción) |
| `JWT_SECRET` | Secret para firmar tokens JWT |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_KEY` | Service role key de Supabase |
| `ANALYTICS_URL` | URL del servicio analytics (ej. `http://backend-analytics:8001`) |
| `ANALYTICS_API_KEY` | Clave para autenticar requests al analytics |
| `SIGHTENGINE_API_USER` | Moderación de imágenes NSFW |
| `SIGHTENGINE_API_SECRET` | Moderación de imágenes NSFW |
| `CORS_ORIGINS` | Orígenes permitidos en producción (separados por coma) |
| `PORT` | Puerto del servidor (default: 3000) |
| `NODE_ENV` | `development` o `production` |

**Nunca commitees `.env`.**

---

## Desarrollo local

```bash
npm install
npm run dev       # ts-node-dev con hot reload
npm run build     # compila a dist/
npm run lint      # eslint
npm test          # vitest (tests unitarios)
```

---

## Base de datos

Schema en `prisma/schema.prisma`.

> **Importante:** `prisma db push` se cuelga con el pooler de Supabase. Flujo correcto:
> 1. Aplicar DDL en **Supabase Dashboard → SQL Editor**
> 2. Ejecutar `npx prisma generate` localmente

---

## Endpoints principales

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/auth/register` | Público |
| `POST` | `/api/auth/login` | Público |
| `GET` | `/api/establishments` | Autenticado |
| `GET` | `/api/establishments/:slug` | Autenticado |
| `GET` | `/api/establishments/:slug/reviews` | Autenticado |
| `POST` | `/api/reviews` | `student` |
| `POST` | `/api/upload` | Autenticado |
| `GET` | `/api/metrics/summary` | `manager`, `admin` |
| `POST` | `/api/metrics/run` | `admin` |
| `GET` | `/api/notifications` | Autenticado |
| `GET` | `/health` | Público |

Documentación completa en `/api/docs` (solo en desarrollo).

---

## Seguridad

- JWT sin fallback secret — `JWT_SECRET` es obligatorio
- Argon2id para hashing de contraseñas
- `userId` en reseñas forzado desde el JWT, nunca del body
- Rate limiting: 5 intentos de login/15 min por IP, 10 reseñas/hora por usuario, 20 uploads/hora por usuario
- Moderación NSFW (Sightengine) antes de subir imágenes a Supabase Storage
- Helmet con CSP y headers de seguridad
- CORS con orígenes explícitos en producción
- Swagger deshabilitado en producción

---

## Tareas programadas

El pipeline de analytics corre automáticamente cada noche a las **2:00 AM** vía `node-cron`, sin intervención manual.

---

## Tests

```bash
npm test                  # vitest — tests unitarios en tests/unit/
```

Cobertura actual: **>89%**. Los tests de integración requieren `.env` válido y se excluyen del CI.
