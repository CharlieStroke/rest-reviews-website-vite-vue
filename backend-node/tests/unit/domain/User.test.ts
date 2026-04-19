import { describe, it, expect } from 'vitest';
import { User, UserRole } from '../../../src/domain/entities/User';

describe('User entity', () => {
  const base = {
    name: 'Carlos Gomez',
    email: 'carlos@anahuac.mx',
    passwordHash: 'hash123',
    role: UserRole.STUDENT,
  };

  it('creates a valid user with defaults', () => {
    const u = User.create(base);
    expect(u.name).toBe('Carlos Gomez');
    expect(u.email).toBe('carlos@anahuac.mx');
    expect(u.role).toBe(UserRole.STUDENT);
    expect(u.isActive).toBe(true);
    expect(u.isVerified).toBe(false);
  });

  it('exposes all optional getters', () => {
    const u = User.create({
      ...base,
      id: 'u-1',
      avatarUrl: 'https://img.com/a.jpg',
      bio: 'Student bio',
      universityId: '12345',
      carrera: 'ITC',
      verificationCode: 'abc',
      verificationExpires: new Date('2026-12-31'),
      isVerified: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    });
    expect(u.id).toBe('u-1');
    expect(u.avatarUrl).toBe('https://img.com/a.jpg');
    expect(u.bio).toBe('Student bio');
    expect(u.universityId).toBe('12345');
    expect(u.carrera).toBe('ITC');
    expect(u.verificationCode).toBe('abc');
    expect(u.verificationExpires).toEqual(new Date('2026-12-31'));
    expect(u.isVerified).toBe(true);
    expect(u.createdAt).toEqual(new Date('2026-01-01'));
    expect(u.updatedAt).toEqual(new Date('2026-01-02'));
  });

  it('throws on invalid email', () => {
    expect(() => User.create({ ...base, email: 'notanemail' })).toThrow('Email structure is invalid');
  });

  it('deactivate sets isActive to false', () => {
    const u = User.create(base);
    expect(u.isActive).toBe(true);
    u.deactivate();
    expect(u.isActive).toBe(false);
  });

  it('verify sets isVerified and clears code', () => {
    const expires = new Date('2026-12-31');
    const u = User.create({ ...base, verificationCode: 'XYZ', verificationExpires: expires });
    u.verify();
    expect(u.isVerified).toBe(true);
    expect(u.verificationCode).toBeUndefined();
    expect(u.verificationExpires).toBeUndefined();
  });

  it('setVerificationCode stores code and expiry', () => {
    const u = User.create(base);
    const expiry = new Date('2026-06-01');
    u.setVerificationCode('CODE123', expiry);
    expect(u.verificationCode).toBe('CODE123');
    expect(u.verificationExpires).toEqual(expiry);
  });

  it('updatePasswordHash replaces the hash', () => {
    const u = User.create(base);
    u.updatePasswordHash('newhash');
    expect(u.passwordHash).toBe('newhash');
  });
});
