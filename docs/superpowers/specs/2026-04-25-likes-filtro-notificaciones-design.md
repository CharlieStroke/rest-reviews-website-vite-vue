# Diseño: Likes, Filtro de Reseñas y Notificaciones Dinámicas

**Fecha:** 2026-04-25  
**Proyecto:** Anáhuac EATS — rest-reviews-website-vite-vue  
**Alcance:** Full stack — Supabase + backend Node + frontend Vue 3

---

## Contexto

Auditoría frontend identificó tres features urgentes sin implementar:
1. Likes en reseñas (stat "48" hardcodeado en ProfilePage, sin infraestructura)
2. Filtro de reseñas en perfil (botón fantasma sin lógica)
3. Notificaciones con mensaje siempre fijo ("El gerente respondió tu reseña")

Fixes menores asociados: greeting hardcodeado en LoginPage, fallback de establecimientos con datos falsos, límite de 3 reseñas en perfil.

---

## Base de Datos (Supabase)

### Nueva tabla: `review_likes`

```sql
CREATE TABLE review_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, review_id)
);
```

- Constraint `UNIQUE(user_id, review_id)`: un like por usuario por reseña.
- `ON DELETE CASCADE`: si se elimina la reseña o el usuario, sus likes desaparecen automáticamente.
- RLS desactivado (consistente con el resto del proyecto).

### Notificaciones de like

Cuando se crea un like, el backend inserta en `notifications`:
```
type = 'like', user_id = autor_de_la_reseña, review_id = id_de_la_reseña
```

Los dos únicos tipos válidos de notificación son:
- `manager_reply` — ya existe
- `like` — nuevo

---

## Backend Node (Express + Clean Architecture)

### Nuevos endpoints

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| POST | `/reviews/:id/like` | ✅ | student |
| DELETE | `/reviews/:id/like` | ✅ | student |

**POST `/reviews/:id/like`**
- Valida que la reseña existe.
- Valida que el usuario no es el autor de la reseña (no puede likear la propia).
- Inserta en `review_likes`. Si ya existe el like, retorna 409.
- Crea notificación `type='like'` para el autor de la reseña.
- Responde: `{ likesCount: number, likedByMe: true }`.

**DELETE `/reviews/:id/like`**
- Elimina el registro de `review_likes` para (userId, reviewId).
- Si no existía, retorna 404.
- Responde: `{ likesCount: number, likedByMe: false }`.

### Endpoints modificados

**GET `/establishments/:slug/reviews`**
- Agrega `likesCount` (COUNT de review_likes) y `likedByMe` (boolean según JWT) a cada review.

**GET `/reviews/my`**
- Agrega `likesCount` a cada review (sin `likedByMe` — no aplica en reseñas propias).

### Nuevos Use Cases

- `LikeReviewUseCase` — inserta like + crea notificación.
- `UnlikeReviewUseCase` — elimina like.

Siguen el patrón de Clean Architecture existente: `application/use-cases/`, inyección vía `tsyringe`.

### Tests unitarios

- `LikeReviewUseCase`: like exitoso, like duplicado (409), like a reseña propia (403), reseña no encontrada (404).
- `UnlikeReviewUseCase`: unlike exitoso, like no existía (404).
- `ReviewController`: tests de integración para los dos nuevos endpoints.

---

## Frontend (Vue 3 + TypeScript)

### ReviewCard — Botón de like

- Aparece en la parte inferior derecha de cada card.
- Muestra el ícono `favorite` de Material Symbols + `likesCount`.
- Estado `likedByMe=true`: ícono relleno en color naranja (`text-orange-500`, `FILL=1`).
- Estado `likedByMe=false`: ícono outline en gris.
- Solo interactivo para rol `student`. Managers y admins ven el contador sin botón.
- **Optimistic UI**: el contador y el estado del ícono se actualizan inmediatamente al hacer click. Si el API falla, se revierte.
- Props nuevas en `EstablishmentReview`: `likesCount: number`, `likedByMe: boolean`.

### ProfilePage

- **Likes stat**: reemplaza el `48` hardcodeado. Se calcula como suma de `likesCount` de todas las reseñas del usuario al cargar el perfil.
- **Campus "Oax"**: reemplazado por stat de "Establecimientos" reseñados (count de establecimientos únicos en las reseñas del usuario). Si es 0, muestra `—`.
- **Reseñas visibles**: de `slice(0, 3)` a `slice(0, 5)`.
- **Botón de filtro**: abre dropdown con tres controles:
  - Establecimiento: `<select>` con opciones derivadas de las reseñas cargadas + "Todos".
  - Calificación mínima: selector de estrellas 1–5 + "Cualquiera".
  - Orden: "Más reciente" (default) / "Más antiguo".
  - Filtrado client-side sobre el array de reseñas ya cargado.
  - Botón "Limpiar filtros" cuando hay algún filtro activo.

### LoginPage

- `"Bienvenido León"` → `"Bienvenido de vuelta"`. Cambio de una línea.

### NotificationPanel

Mensajes dinámicos según `notification.type`:

| type | Texto | Ícono |
|------|-------|-------|
| `manager_reply` | `"El gerente respondió tu reseña"` | `reply` |
| `like` | `"A alguien le gustó tu reseña"` | `favorite` |
| _(desconocido)_ | `"Nueva notificación"` | `notifications` |

Click en notificación de like lleva a `/my-reviews` (mismo destino que manager_reply por ahora).

### EstablishmentsPage — Error state

- El fallback con los 4 establecimientos hardcodeados se elimina.
- En su lugar: mensaje de error + botón "Reintentar" que vuelve a llamar al API.

### Tests frontend

- `ReviewCard`: renderiza like button para student, no para manager/admin; optimistic update al hacer click; reversión si falla el API.
- `NotificationPanel`: renderiza mensaje correcto para cada tipo de notificación.
- `ProfilePage`: filtros reducen el array correctamente; stats dinámicos se calculan desde las reseñas.

---

## Orden de implementación sugerido (para agentes paralelos)

Los tres bloques son independientes y pueden ejecutarse en paralelo:

| Agente | Scope |
|--------|-------|
| A — Backend likes | `review_likes` DDL + LikeReviewUseCase + UnlikeReviewUseCase + endpoints + tests |
| B — Frontend likes + ProfilePage | ReviewCard like button + ProfilePage stats dinámicos + filtro + slice(0,5) |
| C — Fixes menores | LoginPage greeting + NotificationPanel dinámico + EstablishmentsPage error state + tests |

El Agente B depende del contrato de tipos que establece el Agente A (campos `likesCount` y `likedByMe`). Se puede coordinar si el Agente B parte de los tipos ya definidos.

---

## Restricciones

- No se puede likear la propia reseña (validación backend).
- Solo rol `student` puede dar likes.
- Rate limiting existente no aplica a likes (son acciones de baja frecuencia). No añadir rate limit por ahora.
- No hay endpoint para "quién dio like" — solo el contador es público.
- Los likes **no** disparan el pipeline de analytics.
