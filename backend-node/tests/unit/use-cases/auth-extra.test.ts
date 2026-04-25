import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { ChangePasswordUseCase } from '@/application/use-cases/auth/ChangePasswordUseCase';
import { ListEstablishmentReviewsUseCase } from '@/application/use-cases/reviews/ListEstablishmentReviewsUseCase';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { IEstablishmentRepository } from '@/domain/repositories/IEstablishmentRepository';
import { UserRole } from '@/domain/entities/User';

vi.mock('argon2', () => ({
  verify: vi.fn(),
  hash: vi.fn().mockResolvedValue('new-hash'),
}));

import * as argon2 from 'argon2';

describe('ChangePasswordUseCase', () => {
  const makeUser = () => ({
    id: 'u-1',
    passwordHash: 'old-hash',
    role: UserRole.STUDENT,
    updatePasswordHash: vi.fn(),
  });

  it('throws 404 when user not found', async () => {
    const repo: IUserRepository = { findById: vi.fn().mockResolvedValue(null) } as any;
    await expect(
      new ChangePasswordUseCase(repo).execute('bad', { currentPassword: 'a', newPassword: 'b' })
    ).rejects.toThrow('User not found');
  });

  it('throws 400 when current password is wrong', async () => {
    vi.mocked(argon2.verify).mockResolvedValueOnce(false);
    const repo: IUserRepository = { findById: vi.fn().mockResolvedValue(makeUser()) } as any;
    await expect(
      new ChangePasswordUseCase(repo).execute('u-1', { currentPassword: 'wrong', newPassword: 'new' })
    ).rejects.toThrow('contraseña actual es incorrecta');
  });

  it('updates password when credentials are correct', async () => {
    vi.mocked(argon2.verify).mockResolvedValueOnce(true);
    const user = makeUser();
    const repo: IUserRepository = {
      findById: vi.fn().mockResolvedValue(user),
      update: vi.fn().mockResolvedValue(user),
    } as any;
    await new ChangePasswordUseCase(repo).execute('u-1', { currentPassword: 'old', newPassword: 'new' });
    expect(user.updatePasswordHash).toHaveBeenCalledWith('new-hash');
    expect(repo.update).toHaveBeenCalled();
  });
});

describe('ListEstablishmentReviewsUseCase', () => {
  it('throws 404 when slug not found', async () => {
    const reviewRepo: IReviewRepository = {} as any;
    const estRepo: IEstablishmentRepository = { findBySlug: vi.fn().mockResolvedValue(null) } as any;
    await expect(
      new ListEstablishmentReviewsUseCase(reviewRepo, estRepo).execute('bad-slug')
    ).rejects.toThrow('Establishment not found');
  });

  it('returns reviews for a valid slug', async () => {
    const reviews = [{ id: 'r1' }, { id: 'r2' }];
    const estRepo: IEstablishmentRepository = {
      findBySlug: vi.fn().mockResolvedValue({ id: 'est-1' }),
    } as any;
    const reviewRepo: IReviewRepository = {
      findByEstablishmentId: vi.fn().mockResolvedValue({ data: reviews, total: 2 }),
    } as any;
    const result = await new ListEstablishmentReviewsUseCase(reviewRepo, estRepo).execute('delyfull', { page: 1, limit: 10 });
    expect(result.total).toBe(2);
    expect(reviewRepo.findByEstablishmentId).toHaveBeenCalledWith('est-1', { page: 1, limit: 10 }, undefined);
  });
});
