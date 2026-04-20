import { describe, it, expect } from 'vitest';
import { Establishment } from '../../../src/domain/entities/Establishment';
import { EstablishmentPost } from '../../../src/domain/entities/EstablishmentPost';

describe('Establishment entity', () => {
  const base = { name: 'DelyFull' };

  it('exposes isActive, createdAt, updatedAt getters', () => {
    const now = new Date('2026-01-01');
    const e = Establishment.create({ ...base, isActive: false, createdAt: now, updatedAt: now });
    expect(e.isActive).toBe(false);
    expect(e.createdAt).toEqual(now);
    expect(e.updatedAt).toEqual(now);
  });

  it('assignManager sets managerId', () => {
    const e = Establishment.create(base);
    expect(e.managerId).toBeUndefined();
    e.assignManager('mgr-1');
    expect(e.managerId).toBe('mgr-1');
  });
});

describe('EstablishmentPost entity', () => {
  const base = { establishmentId: 'est-1', authorId: 'u-1', content: 'Hoy hay pozole' };

  it('exposes updatedAt getter', () => {
    const date = new Date('2026-03-01');
    const p = EstablishmentPost.create({ ...base, updatedAt: date });
    expect(p.updatedAt).toEqual(date);
  });
});
