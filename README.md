# Anáhuac Eats

Plataforma de reseñas de restaurantes universitarios para el campus Anáhuac Oaxaca. Ecosistema cerrado exclusivo para la comunidad universitaria — sin indexación pública.

[![CI](https://github.com/CharlieMorales13/rest-reviews-website-vite-vue/actions/workflows/ci.yml/badge.svg)](https://github.com/CharlieMorales13/rest-reviews-website-vite-vue/actions/workflows/ci.yml)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://anahuac-eats.com)
[![Architecture](https://img.shields.io/badge/Architecture-Clean_Architecture-blue)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## Arquitectura

```
┌─────────────────────────────────────────────┐
│              anahuac-eats.com               │
│           Frontend SPA (Vercel CDN)         │
└─────────────────────┬───────────────────────┘
                      │ HTTPS
          ┌───────────▼───────────┐
          │   api.anahuac-eats.com │
          │  nginx + Let's Encrypt │
          └───────────┬───────────┘
                      │ HTTP (interna)
          ┌───────────▼───────────┐     ┌──────────────────────┐
          │   Backend Node        │────▶│  Backend Analytics   │
          │  Express + TypeScript │ HTTP│  FastAPI + Python    │
          │   Clean Architecture  │     │  RoBERTa transformer │
          └───────────┬───────────┘     └──────────────────────┘
                      │
          ┌───────────▼───────────┐
          │    Supabase Cloud      │
          │  PostgreSQL + Storage  │
          └───────────────────────┘
```

| Servicio | Tecnología | Docs |
|---|---|---|
| Frontend | Vue 3 + Vite + TypeScript + Pinia | [README-frontend.md](frontend/README-frontend.md) |
| Backend Node | Express + TypeScript + Prisma + tsyringe | [README-node.md](backend-node/README-node.md) |
| Backend Analytics | FastAPI + Python + PyTorch + RoBERTa | [README-analytics.md](backend-analytics/README-analytics.md) |
| Base de datos | Supabase (PostgreSQL + Storage + Realtime) | — |

---

## Roles y permisos (RBAC)

| Rol | Permisos |
|---|---|
| `student` | Ver establecimientos, crear/editar/eliminar propias reseñas |
| `manager` | Dashboard de métricas de su establecimiento, responder reseñas |
| `admin` | Todo lo anterior + gestión de usuarios, establecimientos y pipeline ML |

---

## Requisitos

- Node.js 20+
- Python 3.10+
- Docker + Docker Compose v2
- Cuenta Supabase

---

## Variables de entorno

Cada servicio requiere su propio `.env`. Copia los ejemplos y completa los valores:

```bash
cp backend-node/.env.example   backend-node/.env
cp backend-analytics/.env.example  backend-analytics/.env
cp frontend/.env.example       frontend/.env
```

**Nunca commitees archivos `.env`.**

---

## Desarrollo local

```bash
# Backend Node
cd backend-node && npm install && npm run dev

# Backend Analytics
cd backend-analytics
python -m venv venv
source venv/bin/activate        # Linux/Mac
.\venv\Scripts\activate         # Windows
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend && npm install && npm run dev
```

Con Docker (todos los servicios):

```bash
docker compose up --build
```

---

## Tests

```bash
# Backend Node — unitarios (vitest)
cd backend-node && npm test

# Backend Analytics — unitarios + cobertura (pytest)
cd backend-analytics
source venv/bin/activate
pytest tests/unit/ -v --cov
```

Cobertura actual: **>89% Node**, **>80% Python** (118 tests).

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) en cada push a `master`:

| Job | Qué hace |
|---|---|
| `test-analytics` | ruff lint + pytest (en paralelo) |
| `test-node` | eslint + vitest (en paralelo) |
| `deploy` | SSH → VM → `git pull` → `docker compose up -d --build` |

El frontend se despliega automáticamente en **Vercel** en cada push a `master`.

---

## Base de datos

Schema en `backend-node/prisma/schema.prisma`.

> **Importante:** `prisma db push` se cuelga con el pooler de Supabase. Aplica cambios DDL directamente en **Supabase Dashboard → SQL Editor**, luego ejecuta `npx prisma generate` localmente.

---

## Seguridad

- JWT con secret obligatorio (sin fallback)
- Argon2id para hashing de contraseñas
- Helmet + CORS con orígenes explícitos
- Rate limiting por IP (auth) y por `userId` (reviews, uploads)
- Moderación de imágenes NSFW (Sightengine) antes de subir a Storage
- `X-API-Key` protege los endpoints de analytics
- Swagger deshabilitado en producción

---

## IGE — Índice de Experiencia Gastronómica

Puntuación ponderada 0–100 calculada por el servicio de analytics:

| Dimensión | Peso |
|---|---|
| Calidad de comida | 50% |
| Calidad de servicio | 30% |
| Relación precio-valor | 20% |

Pipeline de analytics corre automáticamente cada noche a las 2:00 AM.
