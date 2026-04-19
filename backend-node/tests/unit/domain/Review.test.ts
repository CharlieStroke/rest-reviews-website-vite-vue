import { describe, it, expect } from 'vitest';
import { Review } from '../../../src/domain/entities/Review';

describe('Review entity', () => {
  const base = {
    userId: 'u1',
    establishmentId: 'e1',
    foodScore: 4,
    serviceScore: 3,
    priceScore: 5,
  };

  it('creates a valid review with all required fields', () => {
    const r = Review.create(base);
    expect(r.userId).toBe('u1');
    expect(r.establishmentId).toBe('e1');
    expect(r.foodScore).toBe(4);
    expect(r.serviceScore).toBe(3);
    expect(r.priceScore).toBe(5);
    expect(r.id).toBeUndefined();
  });

  it('exposes all optional getters', () => {
    const r = Review.create({
      ...base,
      id: 'rev-1',
      title: 'Great',
      comment: 'Loved the food here',
      imageUrl: 'https://img.com/a.jpg',
      authorName: 'Carlos',
      authorCarrera: 'ITC',
      establishmentName: 'DelyFull',
      sentiment: 'positive',
      managerReply: 'Thanks!',
      managerReplyAt: new Date('2026-01-01'),
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    });
    expect(r.id).toBe('rev-1');
    expect(r.title).toBe('Great');
    expect(r.comment).toBe('Loved the food here');
    expect(r.imageUrl).toBe('https://img.com/a.jpg');
    expect(r.authorName).toBe('Carlos');
    expect(r.authorCarrera).toBe('ITC');
    expect(r.establishmentName).toBe('DelyFull');
    expect(r.sentiment).toBe('positive');
    expect(r.managerReply).toBe('Thanks!');
    expect(r.managerReplyAt).toEqual(new Date('2026-01-01'));
    expect(r.createdAt).toEqual(new Date('2026-01-01'));
    expect(r.updatedAt).toEqual(new Date('2026-01-02'));
  });

  it('throws on invalid food score', () => {
    expect(() => Review.create({ ...base, foodScore: 0 })).toThrow('Food score must be between 1 and 5');
    expect(() => Review.create({ ...base, foodScore: 6 })).toThrow('Food score must be between 1 and 5');
  });

  it('throws on invalid service score', () => {
    expect(() => Review.create({ ...base, serviceScore: 6 })).toThrow('Service score must be between 1 and 5');
  });

  it('throws on invalid price score', () => {
    expect(() => Review.create({ ...base, priceScore: 0 })).toThrow('Price score must be between 1 and 5');
  });

  it('throws if comment is too short', () => {
    expect(() => Review.create({ ...base, comment: 'bad' })).toThrow('Review comment must be at least 10 characters long');
  });

  it('accepts comment exactly 10 chars', () => {
    const r = Review.create({ ...base, comment: '1234567890' });
    expect(r.comment).toBe('1234567890');
  });

  describe('updateContent', () => {
    it('updates all fields', () => {
      const r = Review.create({ ...base, title: 'Old', comment: 'Old comment here' });
      r.updateContent({ foodScore: 5, serviceScore: 5, priceScore: 5, title: 'New', comment: 'New comment here' });
      expect(r.foodScore).toBe(5);
      expect(r.serviceScore).toBe(5);
      expect(r.priceScore).toBe(5);
      expect(r.title).toBe('New');
      expect(r.comment).toBe('New comment here');
    });

    it('throws on invalid score in updateContent', () => {
      const r = Review.create(base);
      expect(() => r.updateContent({ foodScore: 0 })).toThrow('Food score must be between 1 and 5');
      expect(() => r.updateContent({ serviceScore: 6 })).toThrow('Service score must be between 1 and 5');
      expect(() => r.updateContent({ priceScore: 0 })).toThrow('Price score must be between 1 and 5');
    });

    it('updates only provided fields', () => {
      const r = Review.create({ ...base, title: 'Original' });
      r.updateContent({ foodScore: 2 });
      expect(r.foodScore).toBe(2);
      expect(r.serviceScore).toBe(3);
    });
  });

  describe('addManagerReply', () => {
    it('adds a valid manager reply', () => {
      const r = Review.create(base);
      r.addManagerReply('Thanks for your feedback!');
      expect(r.managerReply).toBe('Thanks for your feedback!');
      expect(r.managerReplyAt).toBeInstanceOf(Date);
    });

    it('trims whitespace from reply', () => {
      const r = Review.create(base);
      r.addManagerReply('  Hello there  ');
      expect(r.managerReply).toBe('Hello there');
    });

    it('throws if reply is too short', () => {
      const r = Review.create(base);
      expect(() => r.addManagerReply('Hi')).toThrow('Manager reply must be at least 5 characters long');
    });

    it('throws if reply is empty', () => {
      const r = Review.create(base);
      expect(() => r.addManagerReply('')).toThrow('Manager reply must be at least 5 characters long');
    });
  });
});
