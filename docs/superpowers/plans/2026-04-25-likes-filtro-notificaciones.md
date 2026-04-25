# Likes, Filtro y Notificaciones Dinámicas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar likes persistentes en reseñas (full stack), filtro de reseñas en perfil, y mensajes dinámicos de notificación; más fixes de UI estática.

**Architecture:** Tres tracks independientes que corren en paralelo. Track A (backend) establece el contrato de tipos que Track B consume. Track C es completamente independiente. Cada track termina con sus propios tests y commit.

**Tech Stack:** Node/Express + Prisma + Supabase (PostgreSQL) | Vue 3 + TypeScript + Pinia | Vitest (backend) | Vitest (frontend)

---

## ═══════════════════════════════════════
## TRACK A — Backend: Likes Full Stack
## ═══════════════════════════════════════

### Task A1: Supabase DDL + Prisma Schema

**Files:**
- Modify: `backend-node/prisma/schema.prisma` (add ReviewLike model)

- [ ] **Step 1: Aplicar DDL en Supabase Dashboard → SQL Editor**

```sql
CREATE TABLE review_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, review_id)
);
```

- [ ] **Step 2: Agregar modelo ReviewLike al schema.prisma**

Abrir `backend-node/prisma/schema.prisma`. Después del modelo `Review` (que termina en `@@map("reviews")`), agregar:

```prisma
model ReviewLike {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  reviewId  String   @map("review_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@unique([userId, reviewId])
  @@map("review_likes")
}
```

También agregar la relación inversa en el modelo `Review` (dentro del bloque de relaciones existente):

```prisma
  likes         ReviewLike[]
```

Y en el modelo `User`:

```prisma
  likes         ReviewLike[]
```

- [ ] **Step 3: Regenerar cliente Prisma**

```bash
cd backend-node && npx prisma generate
```

Expected output: `✔ Generated Prisma Client`

- [ ] **Step 4: Agregar `likesCount` y `likedByMe` a ReviewProps**

Abrir `backend-node/src/domain/entities/Review.ts`. En la interfaz `ReviewProps` agregar:

```typescript
  likesCount?: number;
  likedByMe?: boolean;
```

En la clase `Review`, agregar los getters después de los existentes:

```typescript
  get likesCount(): number {
    return this.props.likesCount ?? 0;
  }
  get likedByMe(): boolean {
    return this.props.likedByMe ?? false;
  }
```

En `mapToDomain` del repositorio (Task A3) se populará desde la DB.

- [ ] **Step 5: Commit**

```bash
cd backend-node
git add prisma/schema.prisma src/domain/entities/Review.ts
git commit -m "feat(reviews): add review_likes table and ReviewLike prisma model"
```

---

### Task A2: Extender CreateNotificationUseCase con tipo

**Files:**
- Modify: `backend-node/src/application/use-cases/notifications/CreateNotificationUseCase.ts`
- Modify: `backend-node/src/domain/entities/Notification.ts`

- [ ] **Step 1: Extender la entidad Notification para aceptar tipo en create**

Abrir `backend-node/src/domain/entities/Notification.ts`.

Cambiar la interfaz `NotificationProps`:

```typescript
export interface NotificationProps {
  id?: string;
  userId: string;
  reviewId: string;
  type?: string;
  isRead?: boolean;
  createdAt?: Date;
}
```

_(ya tiene `type?: string`, no hay cambio en la interfaz)_

El constructor ya tiene `type: "manager_reply"` como default — está bien.

- [ ] **Step 2: Extender CreateNotificationDTO y el use case**

Abrir `backend-node/src/application/use-cases/notifications/CreateNotificationUseCase.ts`.

Reemplazar el contenido completo:

```typescript
import { injectable, inject } from "tsyringe";
import { Notification } from "../../../domain/entities/Notification";
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";

interface CreateNotificationDTO {
  userId: string;
  reviewId: string;
  type?: string;
}

@injectable()
export class CreateNotificationUseCase {
  constructor(
    @inject("INotificationRepository")
    private notificationRepository: INotificationRepository,
  ) {}

  async execute(dto: CreateNotificationDTO): Promise<Notification> {
    const notification = Notification.create({
      userId: dto.userId,
      reviewId: dto.reviewId,
      type: dto.type ?? "manager_reply",
    });
    return this.notificationRepository.save(notification);
  }
}
```

- [ ] **Step 3: Verificar que el test existente sigue pasando**

```bash
cd backend-node && npm test -- --testPathPattern="CreateNotificationUseCase"
```

Expected: PASS (el cambio es backward compatible)

- [ ] **Step 4: Commit**

```bash
git add src/application/use-cases/notifications/CreateNotificationUseCase.ts
git commit -m "feat(notifications): extend CreateNotificationUseCase to accept type param"
```

---

### Task A3: IReviewRepository — métodos de likes

**Files:**
- Modify: `backend-node/src/domain/repositories/IReviewRepository.ts`

- [ ] **Step 1: Agregar métodos de likes a la interfaz**

Abrir `backend-node/src/domain/repositories/IReviewRepository.ts`. Reemplazar el contenido completo:

```typescript
import { Review } from "../entities/Review";

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  findAll(pagination?: {
    page: number;
    limit: number;
  }): Promise<{ data: Review[]; total: number }>;
  findByEstablishmentId(
    establishmentId: string,
    pagination?: { page: number; limit: number },
    viewerId?: string,
  ): Promise<{ data: Review[]; total: number }>;
  findByUserId(userId: string): Promise<Review[]>;
  save(review: Review): Promise<Review>;
  update(review: Review): Promise<Review>;
  delete(id: string): Promise<void>;
  addLike(userId: string, reviewId: string): Promise<number>;
  removeLike(userId: string, reviewId: string): Promise<number>;
  getLikesCount(reviewId: string): Promise<number>;
  hasLiked(userId: string, reviewId: string): Promise<boolean>;
  getReviewAuthorId(reviewId: string): Promise<string | null>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/domain/repositories/IReviewRepository.ts
git commit -m "feat(reviews): extend IReviewRepository with like methods"
```

---

### Task A4: LikeReviewUseCase + tests

**Files:**
- Create: `backend-node/src/application/use-cases/reviews/LikeReviewUseCase.ts`
- Create: `backend-node/tests/unit/use-cases/LikeReviewUseCase.test.ts`

- [ ] **Step 1: Escribir el test primero**

Crear `backend-node/tests/unit/use-cases/LikeReviewUseCase.test.ts`:

```typescript
import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LikeReviewUseCase } from '../../../src/application/use-cases/reviews/LikeReviewUseCase';
import { CreateNotificationUseCase } from '../../../src/application/use-cases/notifications/CreateNotificationUseCase';
import type { IReviewRepository } from '../../../src/domain/repositories/IReviewRepository';
import { AppError } from '../../../src/infrastructure/http/errors/AppError';

const mockReviewRepo = {
  findById: vi.fn(),
  addLike: vi.fn(),
  hasLiked: vi.fn(),
  getReviewAuthorId: vi.fn(),
  getLikesCount: vi.fn(),
  findAll: vi.fn(),
  findByEstablishmentId: vi.fn(),
  findByUserId: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  removeLike: vi.fn(),
} as unknown as IReviewRepository;

const mockCreateNotification = {
  execute: vi.fn().mockResolvedValue({}),
} as unknown as CreateNotificationUseCase;

describe('LikeReviewUseCase', () => {
  let useCase: LikeReviewUseCase;

  beforeEach(() => {
    useCase = new LikeReviewUseCase(mockReviewRepo, mockCreateNotification);
    vi.clearAllMocks();
  });

  it('should throw 404 if review does not exist', async () => {
    vi.mocked(mockReviewRepo.findById).mockResolvedValue(null);
    await expect(useCase.execute({ userId: 'u1', reviewId: 'r1' }))
      .rejects.toThrow(AppError);
    await expect(useCase.execute({ userId: 'u1', reviewId: 'r1' }))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw 403 if user tries to like their own review', async () => {
    const { Review } = await import('../../../src/domain/entities/Review');
    const review = Review.create({ id: 'r1', userId: 'u1', establishmentId: 'e1', foodScore: 4, serviceScore: 4, priceScore: 4 });
    vi.mocked(mockReviewRepo.findById).mockResolvedValue(review);
    await expect(useCase.execute({ userId: 'u1', reviewId: 'r1' }))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('should throw 409 if user already liked the review', async () => {
    const { Review } = await import('../../../src/domain/entities/Review');
    const review = Review.create({ id: 'r1', userId: 'author-1', establishmentId: 'e1', foodScore: 4, serviceScore: 4, priceScore: 4 });
    vi.mocked(mockReviewRepo.findById).mockResolvedValue(review);
    vi.mocked(mockReviewRepo.hasLiked).mockResolvedValue(true);
    await expect(useCase.execute({ userId: 'u1', reviewId: 'r1' }))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('should add like and create notification on success', async () => {
    const { Review } = await import('../../../src/domain/entities/Review');
    const review = Review.create({ id: 'r1', userId: 'author-1', establishmentId: 'e1', foodScore: 4, serviceScore: 4, priceScore: 4 });
    vi.mocked(mockReviewRepo.findById).mockResolvedValue(review);
    vi.mocked(mockReviewRepo.hasLiked).mockResolvedValue(false);
    vi.mocked(mockReviewRepo.addLike).mockResolvedValue(5);
    const result = await useCase.execute({ userId: 'u1', reviewId: 'r1' });
    expect(mockReviewRepo.addLike).toHaveBeenCalledWith('u1', 'r1');
    expect(mockCreateNotification.execute).toHaveBeenCalledWith({
      userId: 'author-1', reviewId: 'r1', type: 'like',
    });
    expect(result).toEqual({ likesCount: 5, likedByMe: true });
  });
});
```

- [ ] **Step 2: Correr el test — debe fallar**

```bash
cd backend-node && npm test -- --testPathPattern="LikeReviewUseCase"
```

Expected: FAIL — `Cannot find module LikeReviewUseCase`

- [ ] **Step 3: Implementar LikeReviewUseCase**

Crear `backend-node/src/application/use-cases/reviews/LikeReviewUseCase.ts`:

```typescript
import { injectable, inject } from "tsyringe";
import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { CreateNotificationUseCase } from "../notifications/CreateNotificationUseCase";
import { AppError } from "../../../infrastructure/http/errors/AppError";

interface LikeReviewDTO {
  userId: string;
  reviewId: string;
}

@injectable()
export class LikeReviewUseCase {
  constructor(
    @inject("IReviewRepository") private reviewRepository: IReviewRepository,
    @inject(CreateNotificationUseCase)
    private createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async execute(dto: LikeReviewDTO): Promise<{ likesCount: number; likedByMe: true }> {
    const review = await this.reviewRepository.findById(dto.reviewId);
    if (!review) throw new AppError("Review not found", 404);

    if (review.userId === dto.userId) {
      throw new AppError("No puedes dar like a tu propia reseña", 403);
    }

    const already = await this.reviewRepository.hasLiked(dto.userId, dto.reviewId);
    if (already) throw new AppError("Ya diste like a esta reseña", 409);

    const likesCount = await this.reviewRepository.addLike(dto.userId, dto.reviewId);

    this.createNotificationUseCase
      .execute({ userId: review.userId, reviewId: dto.reviewId, type: "like" })
      .catch(() => {});

    return { likesCount, likedByMe: true };
  }
}
```

- [ ] **Step 4: Correr el test — debe pasar**

```bash
cd backend-node && npm test -- --testPathPattern="LikeReviewUseCase"
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/application/use-cases/reviews/LikeReviewUseCase.ts \
        tests/unit/use-cases/LikeReviewUseCase.test.ts
git commit -m "feat(reviews): add LikeReviewUseCase with tests"
```

---

### Task A5: UnlikeReviewUseCase + tests

**Files:**
- Create: `backend-node/src/application/use-cases/reviews/UnlikeReviewUseCase.ts`
- Create: `backend-node/tests/unit/use-cases/UnlikeReviewUseCase.test.ts`

- [ ] **Step 1: Escribir el test primero**

Crear `backend-node/tests/unit/use-cases/UnlikeReviewUseCase.test.ts`:

```typescript
import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnlikeReviewUseCase } from '../../../src/application/use-cases/reviews/UnlikeReviewUseCase';
import type { IReviewRepository } from '../../../src/domain/repositories/IReviewRepository';
import { AppError } from '../../../src/infrastructure/http/errors/AppError';

const mockReviewRepo = {
  findById: vi.fn(),
  hasLiked: vi.fn(),
  removeLike: vi.fn(),
  getLikesCount: vi.fn(),
  findAll: vi.fn(),
  findByEstablishmentId: vi.fn(),
  findByUserId: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addLike: vi.fn(),
  getReviewAuthorId: vi.fn(),
} as unknown as IReviewRepository;

describe('UnlikeReviewUseCase', () => {
  let useCase: UnlikeReviewUseCase;

  beforeEach(() => {
    useCase = new UnlikeReviewUseCase(mockReviewRepo);
    vi.clearAllMocks();
  });

  it('should throw 404 if like does not exist', async () => {
    vi.mocked(mockReviewRepo.hasLiked).mockResolvedValue(false);
    await expect(useCase.execute({ userId: 'u1', reviewId: 'r1' }))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('should remove like and return updated count', async () => {
    vi.mocked(mockReviewRepo.hasLiked).mockResolvedValue(true);
    vi.mocked(mockReviewRepo.removeLike).mockResolvedValue(3);
    const result = await useCase.execute({ userId: 'u1', reviewId: 'r1' });
    expect(mockReviewRepo.removeLike).toHaveBeenCalledWith('u1', 'r1');
    expect(result).toEqual({ likesCount: 3, likedByMe: false });
  });
});
```

- [ ] **Step 2: Correr el test — debe fallar**

```bash
cd backend-node && npm test -- --testPathPattern="UnlikeReviewUseCase"
```

Expected: FAIL

- [ ] **Step 3: Implementar UnlikeReviewUseCase**

Crear `backend-node/src/application/use-cases/reviews/UnlikeReviewUseCase.ts`:

```typescript
import { injectable, inject } from "tsyringe";
import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { AppError } from "../../../infrastructure/http/errors/AppError";

interface UnlikeReviewDTO {
  userId: string;
  reviewId: string;
}

@injectable()
export class UnlikeReviewUseCase {
  constructor(
    @inject("IReviewRepository") private reviewRepository: IReviewRepository,
  ) {}

  async execute(dto: UnlikeReviewDTO): Promise<{ likesCount: number; likedByMe: false }> {
    const liked = await this.reviewRepository.hasLiked(dto.userId, dto.reviewId);
    if (!liked) throw new AppError("No habías dado like a esta reseña", 404);

    const likesCount = await this.reviewRepository.removeLike(dto.userId, dto.reviewId);
    return { likesCount, likedByMe: false };
  }
}
```

- [ ] **Step 4: Correr el test — debe pasar**

```bash
cd backend-node && npm test -- --testPathPattern="UnlikeReviewUseCase"
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/application/use-cases/reviews/UnlikeReviewUseCase.ts \
        tests/unit/use-cases/UnlikeReviewUseCase.test.ts
git commit -m "feat(reviews): add UnlikeReviewUseCase with tests"
```

---

### Task A6: PrismaReviewRepository — implementar métodos de likes

**Files:**
- Modify: `backend-node/src/infrastructure/repositories/PrismaReviewRepository.ts`

- [ ] **Step 1: Agregar los 4 métodos de likes al repositorio**

Abrir `backend-node/src/infrastructure/repositories/PrismaReviewRepository.ts`. Antes del método `private mapToDomain`, agregar:

```typescript
  async addLike(userId: string, reviewId: string): Promise<number> {
    await prisma.reviewLike.create({ data: { userId, reviewId } });
    return prisma.reviewLike.count({ where: { reviewId } });
  }

  async removeLike(userId: string, reviewId: string): Promise<number> {
    await prisma.reviewLike.delete({
      where: { userId_reviewId: { userId, reviewId } },
    });
    return prisma.reviewLike.count({ where: { reviewId } });
  }

  async getLikesCount(reviewId: string): Promise<number> {
    return prisma.reviewLike.count({ where: { reviewId } });
  }

  async hasLiked(userId: string, reviewId: string): Promise<boolean> {
    const like = await prisma.reviewLike.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });
    return like !== null;
  }

  async getReviewAuthorId(reviewId: string): Promise<string | null> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });
    return review?.userId ?? null;
  }
```

- [ ] **Step 2: Actualizar `findByEstablishmentId` para incluir likesCount y likedByMe**

En el método `findByEstablishmentId`, cambiar la firma para aceptar `viewerId`:

```typescript
  async findByEstablishmentId(
    establishmentId: string,
    pagination?: { page: number; limit: number },
    viewerId?: string,
  ): Promise<{ data: Review[]; total: number }> {
```

Y en el `findMany`, agregar include de likes:

```typescript
        include: {
          user: { select: { name: true, carrera: true } },
          sentimentResults: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { predictedLabel: true },
          },
          _count: { select: { likes: true } },
          likes: viewerId
            ? { where: { userId: viewerId }, select: { userId: true } }
            : false,
        },
```

Y en el `mapToDomain` de este contexto, pasar los datos extra:

```typescript
    return {
      data: data.map((d) =>
        this.mapToDomain(d, {
          likesCount: d._count?.likes ?? 0,
          likedByMe: viewerId ? (d.likes?.length ?? 0) > 0 : false,
        }),
      ),
      total,
    };
```

- [ ] **Step 3: Actualizar `findByUserId` para incluir likesCount**

En el método `findByUserId`, actualizar include:

```typescript
      include: {
        establishment: { select: { name: true } },
        sentimentResults: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { predictedLabel: true },
        },
        _count: { select: { likes: true } },
      },
```

Y el map:

```typescript
    return data.map((d) =>
      this.mapToDomain(d, { likesCount: d._count?.likes ?? 0 }),
    );
```

- [ ] **Step 4: Actualizar `mapToDomain` para aceptar extras**

Cambiar la firma de `mapToDomain`:

```typescript
  private mapToDomain(data: any, extras?: { likesCount?: number; likedByMe?: boolean }): Review {
    return Review.create({
      id: data.id,
      userId: data.userId,
      establishmentId: data.establishmentId,
      foodScore: data.foodScore,
      serviceScore: data.serviceScore,
      priceScore: data.priceScore,
      title: data.title,
      comment: data.comment,
      imageUrl: data.imageUrl,
      authorName: data.user?.name,
      authorCarrera: data.user?.carrera,
      establishmentName: data.establishment?.name,
      sentiment: data.sentimentResults?.[0]?.predictedLabel,
      managerReply: data.managerReply,
      managerReplyAt: data.managerReplyAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      likesCount: extras?.likesCount ?? 0,
      likedByMe: extras?.likedByMe ?? false,
    });
  }
```

- [ ] **Step 5: Correr todos los tests del backend**

```bash
cd backend-node && npm test
```

Expected: todos los tests existentes pasan (los nuevos métodos no tienen test directo de repo — ya cubiertos por los use case tests)

- [ ] **Step 6: Commit**

```bash
git add src/infrastructure/repositories/PrismaReviewRepository.ts
git commit -m "feat(reviews): implement like methods in PrismaReviewRepository"
```

---

### Task A7: ReviewController — endpoints de like/unlike + actualizar getByEstablishment

**Files:**
- Modify: `backend-node/src/infrastructure/http/controllers/ReviewController.ts`

- [ ] **Step 1: Agregar imports y constructor de los nuevos use cases**

En `ReviewController.ts`, agregar al bloque de imports:

```typescript
import { LikeReviewUseCase } from "../../../application/use-cases/reviews/LikeReviewUseCase";
import { UnlikeReviewUseCase } from "../../../application/use-cases/reviews/UnlikeReviewUseCase";
```

En el constructor, agregar después del último `@inject`:

```typescript
    @inject(LikeReviewUseCase)
    private likeReviewUseCase: LikeReviewUseCase,
    @inject(UnlikeReviewUseCase)
    private unlikeReviewUseCase: UnlikeReviewUseCase,
```

- [ ] **Step 2: Agregar handlers `likeReview` y `unlikeReview`**

Al final de la clase, antes del cierre `}`, agregar:

```typescript
  public likeReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const { id } = req.params;
    const result = await this.likeReviewUseCase.execute({ userId, reviewId: id });
    res.status(200).json({ success: true, data: result });
  };

  public unlikeReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const { id } = req.params;
    const result = await this.unlikeReviewUseCase.execute({ userId, reviewId: id });
    res.status(200).json({ success: true, data: result });
  };
```

- [ ] **Step 3: Actualizar `getByEstablishment` para incluir likesCount y likedByMe**

Cambiar la firma del método para extraer userId opcional:

```typescript
  public getByEstablishment = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { slug } = req.params;
    const { page, limit } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const viewerId = (req as any).user?.userId as string | undefined;

    const { data, total } = await this.listEstablishmentReviewsUseCase.execute(
      slug as string,
      { page: pageNum, limit: limitNum },
      viewerId,
    );

    const formatted = data.map((r) => ({
      id: r.id,
      author: r.authorName,
      authorCarrera: r.authorCarrera ?? null,
      title: r.title ?? null,
      comment: r.comment,
      foodScore: r.foodScore,
      serviceScore: r.serviceScore,
      priceScore: r.priceScore,
      imageUrl: r.imageUrl,
      sentiment: r.sentiment,
      managerReply: r.managerReply ?? null,
      managerReplyAt: r.managerReplyAt ?? null,
      likesCount: r.likesCount,
      likedByMe: r.likedByMe,
      createdAt: r.createdAt,
    }));

    res
      .status(200)
      .json(createPaginatedResponse(formatted, total, pageNum, limitNum));
  };
```

- [ ] **Step 4: Actualizar `getMyReviews` para incluir likesCount**

En el map de `getMyReviews`, agregar:

```typescript
      likesCount: r.likesCount,
```

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/http/controllers/ReviewController.ts
git commit -m "feat(reviews): add likeReview/unlikeReview handlers and expose likesCount in responses"
```

---

### Task A8: Actualizar ListEstablishmentReviewsUseCase, routes, optional auth middleware y container

**Files:**
- Modify: `backend-node/src/application/use-cases/reviews/ListEstablishmentReviewsUseCase.ts`
- Modify: `backend-node/src/infrastructure/http/middlewares/AuthMiddleware.ts`
- Modify: `backend-node/src/infrastructure/http/routes/review.routes.ts`
- Modify: `backend-node/src/infrastructure/http/routes/establishment.routes.ts`
- Modify: `backend-node/src/infrastructure/config/container.ts`

- [ ] **Step 1: Extender ListEstablishmentReviewsUseCase para aceptar viewerId**

Abrir `backend-node/src/application/use-cases/reviews/ListEstablishmentReviewsUseCase.ts`. Localizar el método `execute`. Cambiar la firma para aceptar `viewerId` opcional y pasarlo al repositorio:

```typescript
  async execute(
    slug: string,
    pagination?: { page: number; limit: number },
    viewerId?: string,
  ): Promise<{ data: Review[]; total: number }> {
    const establishment = await this.establishmentRepository.findBySlug(slug);
    if (!establishment) throw new AppError("Establishment not found", 404);

    return this.reviewRepository.findByEstablishmentId(
      establishment.id!,
      pagination,
      viewerId,
    );
  }
```

- [ ] **Step 2: Agregar middleware `optionalAuth`**

Abrir `backend-node/src/infrastructure/http/middlewares/AuthMiddleware.ts`. Al final del archivo, agregar:

```typescript
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
  } catch {
    // Token inválido — continuar sin usuario
  }
  next();
};
```

_(Verificar que `jwt`, `env`, `JwtPayload`, `AuthRequest`, `Response`, `NextFunction` ya están importados en ese archivo — si no, agregar los imports necesarios.)_

- [ ] **Step 3: Registrar nuevos use cases en el container**

Abrir `backend-node/src/infrastructure/config/container.ts`. Agregar imports:

```typescript
import { LikeReviewUseCase } from "../use-cases/reviews/LikeReviewUseCase";
import { UnlikeReviewUseCase } from "../use-cases/reviews/UnlikeReviewUseCase";
```

_(Los use cases con `@injectable()` se registran automáticamente por tsyringe al importarse. Solo asegurarse de que los imports estén presentes para que el decorador se ejecute.)_

- [ ] **Step 4: Agregar rutas de like/unlike en review.routes.ts**

Abrir `backend-node/src/infrastructure/http/routes/review.routes.ts`. Agregar antes de `export default reviewRouter`:

```typescript
reviewRouter.post(
  "/:id/like",
  authenticateToken,
  requireRole(["student"]),
  reviewController.likeReview,
);
reviewRouter.delete(
  "/:id/like",
  authenticateToken,
  requireRole(["student"]),
  reviewController.unlikeReview,
);
```

- [ ] **Step 5: Agregar optionalAuth a la ruta de reviews de establecimiento**

Abrir `backend-node/src/infrastructure/http/routes/establishment.routes.ts`. Agregar el import:

```typescript
import { authenticateToken, requireRole, optionalAuth } from "../middlewares/AuthMiddleware";
```

Cambiar la línea de la ruta de reviews:

```typescript
establishmentRouter.get("/:slug/reviews", optionalAuth, reviewController.getByEstablishment);
```

- [ ] **Step 6: Correr todos los tests del backend**

```bash
cd backend-node && npm test
```

Expected: todos los tests pasan

- [ ] **Step 7: Commit**

```bash
git add src/application/use-cases/reviews/ListEstablishmentReviewsUseCase.ts \
        src/infrastructure/http/middlewares/AuthMiddleware.ts \
        src/infrastructure/http/routes/review.routes.ts \
        src/infrastructure/http/routes/establishment.routes.ts \
        src/infrastructure/config/container.ts
git commit -m "feat(reviews): wire like/unlike routes and optional auth for establishment reviews"
```

---

## ═══════════════════════════════════════
## TRACK B — Frontend: Likes + ProfilePage
## ═══════════════════════════════════════

> Track B puede ejecutarse en paralelo con Track A. Los tipos de `likesCount` y `likedByMe` se definen en Task B1 según el contrato del plan (no depende de que Track A esté deployado).

### Task B1: Actualizar tipos TypeScript

**Files:**
- Modify: `frontend/src/entities/review/model/types.ts`

- [ ] **Step 1: Agregar likesCount y likedByMe a los tipos de review**

Abrir `frontend/src/entities/review/model/types.ts`. Agregar campos a `EstablishmentReview`:

```typescript
export interface EstablishmentReview extends Review {
  author: string | null;
  authorCarrera?: string | null;
  likesCount: number;
  likedByMe: boolean;
}
```

Agregar `likesCount` a `MyReview`:

```typescript
export interface MyReview extends Review {
  establishmentName: string | null;
  likesCount: number;
}
```

- [ ] **Step 2: Commit**

```bash
cd frontend
git add src/entities/review/model/types.ts
git commit -m "feat(types): add likesCount and likedByMe to review types"
```

---

### Task B2: ReviewService — métodos likeReview y unlikeReview

**Files:**
- Modify: `frontend/src/entities/review/api/ReviewService.ts`

- [ ] **Step 1: Agregar los dos métodos al service**

Abrir `frontend/src/entities/review/api/ReviewService.ts`. Agregar al final de la clase:

```typescript
  static async likeReview(reviewId: string): Promise<{ likesCount: number; likedByMe: boolean }> {
    const response = await httpClient.post<{ success: boolean; data: { likesCount: number; likedByMe: boolean } }>(
      `/api/reviews/${reviewId}/like`,
    );
    return response.data.data;
  }

  static async unlikeReview(reviewId: string): Promise<{ likesCount: number; likedByMe: boolean }> {
    const response = await httpClient.delete<{ success: boolean; data: { likesCount: number; likedByMe: boolean } }>(
      `/api/reviews/${reviewId}/like`,
    );
    return response.data.data;
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/review/api/ReviewService.ts
git commit -m "feat(reviews): add likeReview and unlikeReview to ReviewService"
```

---

### Task B3: ReviewCard — botón de like + optimistic update + tests

**Files:**
- Modify: `frontend/src/shared/ui/ReviewCard.vue`
- Create: `frontend/src/shared/ui/ReviewCard.test.ts`

- [ ] **Step 1: Escribir el test primero**

Crear `frontend/src/shared/ui/ReviewCard.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ReviewCard from './ReviewCard.vue';
import { ReviewService } from '@/entities/review/api/ReviewService';

vi.mock('@/entities/review/api/ReviewService', () => ({
  ReviewService: {
    likeReview: vi.fn(),
    unlikeReview: vi.fn(),
  },
}));

vi.mock('@/entities/user/model/authStore', () => ({
  useAuthStore: () => ({ userRole: 'student' }),
}));

const baseReview = {
  id: 'r1',
  foodScore: 4,
  serviceScore: 4,
  priceScore: 4,
  createdAt: new Date().toISOString(),
  likesCount: 3,
  likedByMe: false,
};

describe('ReviewCard — likes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra el botón de like para rol student', () => {
    const wrapper = mount(ReviewCard, {
      props: { review: baseReview, showLike: true },
    });
    expect(wrapper.find('[data-testid="like-btn"]').exists()).toBe(true);
  });

  it('no muestra el botón de like si showLike=false', () => {
    const wrapper = mount(ReviewCard, {
      props: { review: baseReview, showLike: false },
    });
    expect(wrapper.find('[data-testid="like-btn"]').exists()).toBe(false);
  });

  it('actualiza el contador optimistamente al hacer click en like', async () => {
    vi.mocked(ReviewService.likeReview).mockResolvedValue({ likesCount: 4, likedByMe: true });
    const wrapper = mount(ReviewCard, {
      props: { review: baseReview, showLike: true },
    });
    await wrapper.find('[data-testid="like-btn"]').trigger('click');
    expect(wrapper.find('[data-testid="like-count"]').text()).toBe('4');
  });

  it('revierte el contador si el API falla', async () => {
    vi.mocked(ReviewService.likeReview).mockRejectedValue(new Error('fail'));
    const wrapper = mount(ReviewCard, {
      props: { review: baseReview, showLike: true },
    });
    await wrapper.find('[data-testid="like-btn"]').trigger('click');
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="like-count"]').text()).toBe('3');
  });
});
```

- [ ] **Step 2: Correr el test — debe fallar**

```bash
cd frontend && npm test -- ReviewCard
```

Expected: FAIL

- [ ] **Step 3: Actualizar ReviewCard.vue**

Abrir `frontend/src/shared/ui/ReviewCard.vue`.

En el `<script setup>`, agregar imports y lógica de likes:

```typescript
import { computed, ref } from 'vue';
import { useAuthStore } from '@/entities/user/model/authStore';
import { ReviewService } from '@/entities/review/api/ReviewService';

// ... (imports existentes se mantienen)

// Agregar a ReviewCardData interface:
// likesCount?: number;
// likedByMe?: boolean;

// Agregar prop:
// showLike?: boolean;

const authStore = useAuthStore();
const canLike = computed(() => authStore.userRole === 'student' && props.showLike);

const localLikesCount = ref(props.review.likesCount ?? 0);
const localLikedByMe = ref(props.review.likedByMe ?? false);
const likeLoading = ref(false);

const toggleLike = async () => {
  if (likeLoading.value) return;
  likeLoading.value = true;
  const prevCount = localLikesCount.value;
  const prevLiked = localLikedByMe.value;
  // Optimistic update
  localLikedByMe.value = !prevLiked;
  localLikesCount.value = prevLiked ? prevCount - 1 : prevCount + 1;
  try {
    const result = localLikedByMe.value
      ? await ReviewService.likeReview(props.review.id)
      : await ReviewService.unlikeReview(props.review.id);
    localLikesCount.value = result.likesCount;
    localLikedByMe.value = result.likedByMe;
  } catch {
    // Revert
    localLikesCount.value = prevCount;
    localLikedByMe.value = prevLiked;
  } finally {
    likeLoading.value = false;
  }
};
```

En `ReviewCardData`, agregar:

```typescript
export interface ReviewCardData {
  // ... campos existentes ...
  likesCount?: number;
  likedByMe?: boolean;
}
```

En `withDefaults(defineProps<{...}>())`, agregar:

```typescript
  showLike?: boolean;
```

con default:

```typescript
  showLike: false,
```

En el `<template>`, dentro del footer de la card (después del bloque de managerReply o al final del `rc__body`), agregar:

```html
<!-- Like button -->
<div v-if="canLike || (review.likesCount ?? 0) > 0" class="rc__like-row">
  <button
    v-if="canLike"
    data-testid="like-btn"
    class="rc__like-btn"
    :class="{ 'rc__like-btn--active': localLikedByMe }"
    :disabled="likeLoading"
    @click="toggleLike"
    :aria-label="localLikedByMe ? 'Quitar like' : 'Dar like'"
  >
    <span
      class="material-symbols-outlined"
      :style="localLikedByMe ? 'font-variation-settings: FILL 1' : ''"
    >favorite</span>
    <span data-testid="like-count">{{ localLikesCount }}</span>
  </button>
  <span v-else class="rc__like-count">
    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">favorite</span>
    <span data-testid="like-count">{{ localLikesCount }}</span>
  </span>
</div>
```

En el `<style>` (si existe sección CSS), agregar:

```css
.rc__like-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
}
.rc__like-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.rc__like-btn:hover {
  background: rgba(255,255,255,0.06);
}
.rc__like-btn--active {
  color: #f97316;
}
.rc__like-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #f97316;
}
```

- [ ] **Step 4: Correr el test — debe pasar**

```bash
cd frontend && npm test -- ReviewCard
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/ReviewCard.vue src/shared/ui/ReviewCard.test.ts
git commit -m "feat(ui): add like button to ReviewCard with optimistic update and tests"
```

---

### Task B4: ProfilePage — stats dinámicos + filtro + mostrar 5 reseñas + tests

**Files:**
- Modify: `frontend/src/pages/profile/ui/ProfilePage.vue`
- Create: `frontend/src/pages/profile/ui/ProfilePage.test.ts`

- [ ] **Step 1: Escribir el test primero**

Crear `frontend/src/pages/profile/ui/ProfilePage.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/entities/review/api/ReviewService', () => ({
  ReviewService: {
    getMyReviews: vi.fn(),
  },
}));

vi.mock('@/entities/user/model/authStore', () => ({
  useAuthStore: () => ({
    user: { name: 'Test User', avatarUrl: null, bio: null, carrera: 'Gastronomía' },
    userRole: 'student',
    fetchProfile: vi.fn(),
  }),
}));

import { ReviewService } from '@/entities/review/api/ReviewService';
import ProfilePage from './ProfilePage.vue';

const makeReviews = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `r${i}`,
    establishmentId: i % 2 === 0 ? 'est-1' : 'est-2',
    establishmentName: i % 2 === 0 ? 'DelyFull' : 'Guajaquenito',
    foodScore: i % 5 + 1,
    serviceScore: 4,
    priceScore: 3,
    createdAt: new Date(2026, 0, i + 1).toISOString(),
    likesCount: i,
    comment: `Review ${i}`,
  }));

describe('ProfilePage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('muestra máximo 5 reseñas', async () => {
    vi.mocked(ReviewService.getMyReviews).mockResolvedValue(makeReviews(8) as any);
    const wrapper = mount(ProfilePage);
    await new Promise((r) => setTimeout(r, 20));
    expect(wrapper.findAll('[data-testid="review-card"]').length).toBeLessThanOrEqual(5);
  });

  it('calcula el total de likes como suma de likesCount', async () => {
    const reviews = makeReviews(3); // likesCount: 0, 1, 2 → total 3
    vi.mocked(ReviewService.getMyReviews).mockResolvedValue(reviews as any);
    const wrapper = mount(ProfilePage);
    await new Promise((r) => setTimeout(r, 20));
    expect(wrapper.find('[data-testid="total-likes"]').text()).toBe('3');
  });

  it('filtra reseñas por establecimiento', async () => {
    vi.mocked(ReviewService.getMyReviews).mockResolvedValue(makeReviews(6) as any);
    const wrapper = mount(ProfilePage);
    await new Promise((r) => setTimeout(r, 20));
    await wrapper.find('[data-testid="filter-establishment"]').setValue('DelyFull');
    const cards = wrapper.findAll('[data-testid="review-card"]');
    cards.forEach((card) => {
      expect(card.text()).toContain('DelyFull');
    });
  });
});
```

- [ ] **Step 2: Correr el test — debe fallar**

```bash
cd frontend && npm test -- ProfilePage
```

Expected: FAIL

- [ ] **Step 3: Actualizar ProfilePage.vue**

Abrir `frontend/src/pages/profile/ui/ProfilePage.vue`.

En el `<script setup>`, reemplazar o ampliar la lógica:

```typescript
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/entities/user/model/authStore';
import { ReviewService } from '@/entities/review/api/ReviewService';
import type { MyReview } from '@/entities/review/model/types';
import EditProfileModal from './EditProfileModal.vue';
import ChangePasswordModal from './ChangePasswordModal.vue';
import ReviewCard from '@/shared/ui/ReviewCard.vue';

const authStore = useAuthStore();
const reviews = ref<MyReview[]>([]);
const reviewCount = ref<number | null>(null);

// Filtros
const filterEstablishment = ref('');
const filterMinScore = ref(0);
const filterOrder = ref<'newest' | 'oldest'>('newest');
const showFilterPanel = ref(false);

const totalLikes = computed(() =>
  reviews.value.reduce((sum, r) => sum + (r.likesCount ?? 0), 0),
);

const uniqueEstablishments = computed(() => {
  const names = reviews.value
    .map((r) => r.establishmentName)
    .filter((n): n is string => !!n);
  return [...new Set(names)];
});

const uniqueEstablishmentCount = computed(() => {
  const ids = new Set(reviews.value.map((r) => r.establishmentId));
  return ids.size;
});

const filteredReviews = computed(() => {
  let result = [...reviews.value];
  if (filterEstablishment.value) {
    result = result.filter((r) => r.establishmentName === filterEstablishment.value);
  }
  if (filterMinScore.value > 0) {
    result = result.filter((r) => {
      const avg = (r.foodScore + r.serviceScore + r.priceScore) / 3;
      return avg >= filterMinScore.value;
    });
  }
  if (filterOrder.value === 'oldest') {
    result = result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return result.slice(0, 5);
});

const hasActiveFilters = computed(
  () => filterEstablishment.value !== '' || filterMinScore.value > 0 || filterOrder.value !== 'newest',
);

const clearFilters = () => {
  filterEstablishment.value = '';
  filterMinScore.value = 0;
  filterOrder.value = 'newest';
};

onMounted(async () => {
  authStore.fetchProfile();
  try {
    const myReviews = await ReviewService.getMyReviews();
    reviews.value = myReviews;
    reviewCount.value = myReviews.length;
  } catch {
    reviewCount.value = 0;
  }
});

const userName = computed(() => authStore.user?.name || 'Cargando...');
const userBio = computed(() => authStore.user?.bio || null);
const userAvatar = computed(() => authStore.user?.avatarUrl || null);
const userCarrera = computed(() => authStore.user?.carrera || null);
const userInitials = computed(() => {
  const parts = userName.value.split(' ');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] || '') + (parts[1][0] || '');
  }
  return (parts[0] || '').substring(0, 2).toUpperCase();
});

const isEditModalOpen = ref(false);
const isChangePasswordOpen = ref(false);
```

En el `<template>`, actualizar el bloque de stats:

```html
<div class="grid grid-cols-3 gap-4 mt-12 py-6 border-y border-outline-variant/15">
  <div class="text-center">
    <span class="block text-2xl font-headline font-black text-on-surface">{{ reviewCount !== null ? reviewCount : '...' }}</span>
    <span class="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Reseñas</span>
  </div>
  <div class="text-center border-x border-outline-variant/15">
    <span data-testid="total-likes" class="block text-2xl font-headline font-black text-on-surface">{{ totalLikes }}</span>
    <span class="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Likes</span>
  </div>
  <div class="text-center">
    <span class="block text-2xl font-headline font-black text-on-surface">{{ uniqueEstablishmentCount || '—' }}</span>
    <span class="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Establecimientos</span>
  </div>
</div>
```

Reemplazar el botón de filtro fantasma por un panel funcional:

```html
<div class="flex items-center justify-between mb-8">
  <h3 class="text-2xl font-headline font-bold text-[#f9f5f8]">Mis Reseñas Históricas</h3>
  <div class="relative">
    <button
      class="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
      :class="{ 'text-primary': hasActiveFilters }"
      @click="showFilterPanel = !showFilterPanel"
    >
      <span class="material-symbols-outlined">filter_list</span>
    </button>

    <!-- Filter panel -->
    <div v-if="showFilterPanel" class="absolute right-0 mt-2 w-64 bg-surface-container-high rounded-2xl border border-outline-variant/20 shadow-xl p-4 z-10 space-y-4">
      <div>
        <label class="text-xs text-on-surface-variant uppercase tracking-wider block mb-1">Establecimiento</label>
        <select
          data-testid="filter-establishment"
          v-model="filterEstablishment"
          class="w-full bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-sm border border-outline-variant/20"
        >
          <option value="">Todos</option>
          <option v-for="name in uniqueEstablishments" :key="name" :value="name">{{ name }}</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-on-surface-variant uppercase tracking-wider block mb-1">Calificación mínima</label>
        <select
          v-model.number="filterMinScore"
          class="w-full bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-sm border border-outline-variant/20"
        >
          <option :value="0">Cualquiera</option>
          <option :value="1">1+ estrella</option>
          <option :value="2">2+ estrellas</option>
          <option :value="3">3+ estrellas</option>
          <option :value="4">4+ estrellas</option>
          <option :value="5">5 estrellas</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-on-surface-variant uppercase tracking-wider block mb-1">Orden</label>
        <select
          v-model="filterOrder"
          class="w-full bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-sm border border-outline-variant/20"
        >
          <option value="newest">Más reciente</option>
          <option value="oldest">Más antiguo</option>
        </select>
      </div>
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="w-full text-xs text-on-surface-variant hover:text-error transition-colors"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
</div>
```

Cambiar el `v-for` en las reseñas:

```html
<ReviewCard
  v-for="rev in filteredReviews"
  :key="rev.id"
  data-testid="review-card"
  :review="rev"
  :show-author="false"
  :show-establishment="true"
  :show-sentiment="true"
  :show-like="false"
/>
```

_(Las reseñas propias no tienen botón de like — no tiene sentido likear las propias)_

- [ ] **Step 4: Correr el test — debe pasar**

```bash
cd frontend && npm test -- ProfilePage
```

Expected: PASS (3 tests)

- [ ] **Step 5: Activar showLike en EstablishmentDetailsPage**

En el componente donde se renderizan las reseñas de un establecimiento (probablemente `frontend/src/pages/establishments/ui/EstablishmentDetailsPage.vue`), buscar el uso de `<ReviewCard>` y agregar `:show-like="authStore.userRole === 'student'"`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/profile/ui/ProfilePage.vue \
        src/pages/profile/ui/ProfilePage.test.ts \
        src/pages/establishments/ui/EstablishmentDetailsPage.vue
git commit -m "feat(profile): dynamic likes stat, filter panel, show 5 reviews, like button in establishment view"
```

---

## ═══════════════════════════════════════
## TRACK C — Frontend: Fixes Menores
## ═══════════════════════════════════════

> Track C es completamente independiente de A y B. Puede ejecutarse en paralelo desde el inicio.

### Task C1: LoginPage — fix greeting

**Files:**
- Modify: `frontend/src/pages/login/ui/LoginPage.vue`

- [ ] **Step 1: Cambiar el texto hardcodeado**

Abrir `frontend/src/pages/login/ui/LoginPage.vue`. Buscar la línea:

```html
<h1 class="text-3xl font-bold tracking-tight text-white mb-2">Bienvenido León</h1>
```

Cambiar a:

```html
<h1 class="text-3xl font-bold tracking-tight text-white mb-2">Bienvenido de vuelta</h1>
```

- [ ] **Step 2: Commit**

```bash
cd frontend
git add src/pages/login/ui/LoginPage.vue
git commit -m "fix(login): remove hardcoded name from greeting"
```

---

### Task C2: NotificationPanel — mensajes dinámicos + tests

**Files:**
- Modify: `frontend/src/entities/notification/ui/NotificationPanel.vue`
- Create: `frontend/src/entities/notification/ui/NotificationPanel.test.ts`

- [ ] **Step 1: Escribir el test primero**

Crear `frontend/src/entities/notification/ui/NotificationPanel.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NotificationPanel from './NotificationPanel.vue';

vi.mock('../model/notificationStore', () => ({
  useNotificationStore: () => ({
    notifications: [
      { id: '1', type: 'manager_reply', isRead: false, createdAt: new Date().toISOString(), reviewId: 'r1' },
      { id: '2', type: 'like', isRead: true, createdAt: new Date().toISOString(), reviewId: 'r2' },
      { id: '3', type: 'unknown_type', isRead: false, createdAt: new Date().toISOString(), reviewId: 'r3' },
    ],
    markAsRead: vi.fn(),
  }),
}));

describe('NotificationPanel', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('muestra mensaje correcto para manager_reply', () => {
    const wrapper = mount(NotificationPanel);
    expect(wrapper.text()).toContain('El gerente respondió tu reseña');
  });

  it('muestra mensaje correcto para like', () => {
    const wrapper = mount(NotificationPanel);
    expect(wrapper.text()).toContain('A alguien le gustó tu reseña');
  });

  it('muestra mensaje genérico para tipo desconocido', () => {
    const wrapper = mount(NotificationPanel);
    expect(wrapper.text()).toContain('Nueva notificación');
  });

  it('usa ícono favorite para notificación de like', () => {
    const wrapper = mount(NotificationPanel);
    const icons = wrapper.findAll('.material-symbols-outlined');
    const texts = icons.map((i) => i.text());
    expect(texts).toContain('favorite');
  });
});
```

- [ ] **Step 2: Correr el test — debe fallar**

```bash
cd frontend && npm test -- NotificationPanel
```

Expected: FAIL

- [ ] **Step 3: Actualizar NotificationPanel.vue**

Abrir `frontend/src/entities/notification/ui/NotificationPanel.vue`. Reemplazar el contenido completo:

```vue
<script setup lang="ts">
import { useNotificationStore } from '../model/notificationStore';
import { useRouter } from 'vue-router';

const notifStore = useNotificationStore();
const router = useRouter();

const notificationConfig: Record<string, { message: string; icon: string }> = {
  manager_reply: { message: 'El gerente respondió tu reseña', icon: 'reply' },
  like: { message: 'A alguien le gustó tu reseña', icon: 'favorite' },
};

const getConfig = (type: string) =>
  notificationConfig[type] ?? { message: 'Nueva notificación', icon: 'notifications' };

const handleClick = async (id: string) => {
  await notifStore.markAsRead(id);
  router.push('/my-reviews');
};
</script>

<template>
  <div class="absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden bg-[#1f1f22] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50">
    <div class="px-4 py-3 border-b border-white/5">
      <p class="text-sm font-bold text-white">Notificaciones</p>
    </div>

    <div v-if="notifStore.notifications.length === 0" class="px-4 py-6 text-center text-xs text-[#adaaad]">
      Sin notificaciones
    </div>

    <ul class="max-h-72 overflow-y-auto divide-y divide-white/5">
      <li
        v-for="n in notifStore.notifications"
        :key="n.id"
        class="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5"
        :class="n.isRead ? 'opacity-60' : ''"
        @click="handleClick(n.id)"
      >
        <span class="material-symbols-outlined text-orange-400 text-base mt-0.5 shrink-0">
          {{ getConfig(n.type).icon }}
        </span>
        <div class="min-w-0">
          <p class="text-xs text-white leading-snug">{{ getConfig(n.type).message }}</p>
          <p class="text-[10px] text-[#adaaad] mt-0.5">{{ new Date(n.createdAt).toLocaleDateString('es-MX') }}</p>
        </div>
        <span v-if="!n.isRead" class="ml-auto mt-1.5 w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
      </li>
    </ul>
  </div>
</template>
```

- [ ] **Step 4: Correr el test — debe pasar**

```bash
cd frontend && npm test -- NotificationPanel
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/entities/notification/ui/NotificationPanel.vue \
        src/entities/notification/ui/NotificationPanel.test.ts
git commit -m "feat(notifications): dynamic messages by type with tests"
```

---

### Task C3: EstablishmentsPage — error state real + tests

**Files:**
- Modify: `frontend/src/pages/establishments/ui/EstablishmentsPage.vue`
- Create: `frontend/src/pages/establishments/ui/EstablishmentsPage.test.ts`

- [ ] **Step 1: Escribir el test primero**

Crear `frontend/src/pages/establishments/ui/EstablishmentsPage.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EstablishmentsPage from './EstablishmentsPage.vue';
import { ReviewService } from '@/entities/review/api/ReviewService';

vi.mock('@/entities/review/api/ReviewService', () => ({
  ReviewService: { getEstablishments: vi.fn() },
}));
vi.mock('@/entities/user/model/authStore', () => ({
  useAuthStore: () => ({ userRole: 'student' }),
}));
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('EstablishmentsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra botón de reintentar cuando falla la API', async () => {
    vi.mocked(ReviewService.getEstablishments).mockRejectedValue(new Error('fail'));
    const wrapper = mount(EstablishmentsPage);
    await new Promise((r) => setTimeout(r, 20));
    expect(wrapper.find('[data-testid="retry-btn"]').exists()).toBe(true);
  });

  it('no muestra establecimientos hardcodeados en estado de error', async () => {
    vi.mocked(ReviewService.getEstablishments).mockRejectedValue(new Error('fail'));
    const wrapper = mount(EstablishmentsPage);
    await new Promise((r) => setTimeout(r, 20));
    expect(wrapper.text()).not.toContain('DelyFull');
  });

  it('llama a getEstablishments de nuevo al hacer click en reintentar', async () => {
    vi.mocked(ReviewService.getEstablishments)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce([]);
    const wrapper = mount(EstablishmentsPage);
    await new Promise((r) => setTimeout(r, 20));
    await wrapper.find('[data-testid="retry-btn"]').trigger('click');
    expect(ReviewService.getEstablishments).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Correr el test — debe fallar**

```bash
cd frontend && npm test -- EstablishmentsPage
```

Expected: FAIL

- [ ] **Step 3: Actualizar EstablishmentsPage.vue — quitar fallback hardcodeado**

Abrir `frontend/src/pages/establishments/ui/EstablishmentsPage.vue`.

En el bloque `catch` de `fetchEstablishments`, eliminar el fallback hardcodeado:

```typescript
const fetchEstablishments = async () => {
  loading.value = true;
  errorMsg.value = null;
  try {
    const result = await ReviewService.getEstablishments();
    establishments.value = result;
  } catch {
    errorMsg.value = 'No se pudieron cargar los establecimientos.';
    establishments.value = [];
  } finally {
    loading.value = false;
  }
};
```

En el `<template>`, reemplazar el bloque de estado de error (buscar donde se usa `errorMsg`) por:

```html
<div v-if="errorMsg" class="text-center py-16">
  <span class="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">wifi_off</span>
  <p class="text-on-surface-variant mb-6">{{ errorMsg }}</p>
  <button
    data-testid="retry-btn"
    @click="fetchEstablishments"
    class="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors"
  >
    Reintentar
  </button>
</div>
```

- [ ] **Step 4: Correr el test — debe pasar**

```bash
cd frontend && npm test -- EstablishmentsPage
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/pages/establishments/ui/EstablishmentsPage.vue \
        src/pages/establishments/ui/EstablishmentsPage.test.ts
git commit -m "fix(establishments): replace hardcoded fallback with real error state and retry button"
```

---

## Merge final

Después de que los tres tracks estén completos y todos los tests pasen:

```bash
# Desde cada rama feature (si se trabajó en ramas separadas):
git checkout master
git merge --no-ff feat/likes-backend
git merge --no-ff feat/likes-frontend
git merge --no-ff feat/ui-fixes
git push origin master
```

Si se trabajó directamente en master (agentes sin rama propia), solo:

```bash
cd backend-node && npm test
cd frontend && npm test
git push origin master
```
