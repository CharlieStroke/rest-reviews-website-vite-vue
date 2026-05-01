import { describe, it, expect } from 'vitest';
import { isTokenExpired } from './jwt';

function makeToken(expOffsetSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds;
  const payload = btoa(JSON.stringify({ exp, sub: 'u1' }));
  return `header.${payload}.signature`;
}

describe('isTokenExpired', () => {
  it('returns false for a token that expires in the future', () => {
    expect(isTokenExpired(makeToken(3600))).toBe(false);
  });

  it('returns true for a token that expired in the past', () => {
    expect(isTokenExpired(makeToken(-3600))).toBe(true);
  });

  it('returns true for a token with no exp field', () => {
    const payload = btoa(JSON.stringify({ sub: 'u1' }));
    expect(isTokenExpired(`header.${payload}.signature`)).toBe(true);
  });

  it('returns true for a token missing the middle segment', () => {
    expect(isTokenExpired('onlyone')).toBe(true);
  });

  it('returns true for a token with non-JSON payload', () => {
    expect(isTokenExpired('header.!!!invalid!!!.signature')).toBe(true);
  });
});
