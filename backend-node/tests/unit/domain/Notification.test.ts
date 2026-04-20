import { describe, it, expect } from 'vitest';
import { Notification } from '../../../src/domain/entities/Notification';

describe('Notification entity', () => {
  it('creates a valid notification', () => {
    const n = Notification.create({
      userId: 'user-uuid',
      reviewId: 'review-uuid',
    });
    expect(n.userId).toBe('user-uuid');
    expect(n.reviewId).toBe('review-uuid');
    expect(n.type).toBe('manager_reply');
    expect(n.isRead).toBe(false);
  });

  it('accepts an existing id and isRead=true', () => {
    const n = Notification.create({
      id: 'notif-uuid',
      userId: 'user-uuid',
      reviewId: 'review-uuid',
      isRead: true,
    });
    expect(n.id).toBe('notif-uuid');
    expect(n.isRead).toBe(true);
  });

  it('exposes createdAt getter', () => {
    const date = new Date('2026-01-01');
    const n = Notification.create({ userId: 'u', reviewId: 'r', createdAt: date });
    expect(n.createdAt).toEqual(date);
  });

  it('markAsRead sets isRead to true', () => {
    const n = Notification.create({ userId: 'u', reviewId: 'r' });
    expect(n.isRead).toBe(false);
    n.markAsRead();
    expect(n.isRead).toBe(true);
  });
});
