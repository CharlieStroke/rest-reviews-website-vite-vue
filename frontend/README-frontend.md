# Anáhuac Eats — Frontend

SPA construida con **Vue 3**, **Vite** y arquitectura **Feature-Sliced Design (FSD)**. Desplegada en Vercel con dominio custom y HTTPS.

---

## Stack

| Tecnología | Uso |
|---|---|
| Vue 3 (Composition API) | Framework principal |
| Vite | Build tool + HMR |
| TypeScript (strict) | Tipado estático |
| Pinia | State management |
| Vue Router | Navegación SPA |
| Tailwind CSS | Estilos utilitarios |
| Axios | HTTP client |

---

## Arquitectura — Feature-Sliced Design

```
frontend/src/
├── app/          # Inicialización global (App.vue, router, estilos)
├── pages/        # Vistas completas (una por ruta)
├── widgets/      # Bloques UI autónomos (Sidebar, Charts)
├── features/     # Interacciones de usuario con valor de negocio
├── entities/     # Modelos de dominio + servicios API
│   ├── review/   # ReviewService, tipos
│   └── user/     # UserService, tipos
└── shared/       # UI base reutilizable, composables, utils
    ├── ui/       # BaseButton, AppToast, Spinner, ImageLightbox...
    └── lib/      # useToast, useAuth...
```

**Regla de dependencias:** cada capa solo puede importar de capas inferiores.

---

## Variables de entorno

Crea `frontend/.env` desde `frontend/.env.example`:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend Node (sin `/`) |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |

**Nunca commitees `.env`.**

---

## Desarrollo local

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build     # build de producción
npm run preview   # preview del build
```

---

## Despliegue (Vercel)

El frontend se despliega automáticamente en cada push a `master` a través de Vercel.

Configuración del proyecto en Vercel:

| Campo | Valor |
|---|---|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

El archivo `vercel.json` en esta carpeta configura el rewrite necesario para que Vue Router funcione en producción:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## Rutas principales

| Ruta | Vista | Acceso |
|---|---|---|
| `/` | Home / Login | Público |
| `/establishments` | Lista de establecimientos | Autenticado |
| `/establishments/:slug` | Detalle + reseñas | Autenticado |
| `/create-review/:slug` | Crear reseña | `student` |
| `/dashboard` | Dashboard según rol | Autenticado |
| `/manager/mi-establecimiento` | Dashboard gerente | `manager` |
| `/admin` | Panel administrador | `admin` |
| `/profile` | Perfil de usuario | Autenticado |

---

## Navegación por slug

Todos los `router.push` a establecimientos usan `est.slug`, no `est.id`. `CreateReviewPage` resuelve el slug al UUID real antes de llamar a `ReviewService.create`.

---

## Seguridad frontend

- JWT almacenado en memoria (no localStorage)
- Guards de navegación por rol en Vue Router
- Sin SSR — SPA pura para evitar indexación (ecosistema cerrado universitario)
