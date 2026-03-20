import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/infrastructure/http/server';
import type { Server } from 'http';

const API_URL = 'http://localhost:3001/api';
let server: Server;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(3001, resolve);
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('POST /api/auth/login', () => {
  it('should return 200 and a token with valid credentials', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@anahuac.mx',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('token');
    expect(typeof body.data.token).toBe('string');
    expect(body.data.token.length).toBeGreaterThan(0);
  });

  it('should return 401 with invalid password', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@anahuac.mx',
        password: 'wrongpassword',
      }),
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(body.success).toBeFalsy();
  });

  it('should return an error with non-existent email', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'noexiste@anahuac.mx',
        password: 'password123',
      }),
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(body.success).toBeFalsy();
  });
});

describe('GET /api/establishments', () => {
  it('should return 200 with a list of establishments', async () => {
    const res = await fetch(`${API_URL}/establishments`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.meta).toBeDefined();
    expect(body.meta).toHaveProperty('total');
    expect(body.meta).toHaveProperty('page');
    expect(body.meta).toHaveProperty('limit');
    expect(body.meta).toHaveProperty('totalPages');
  });

  it('should support pagination parameters', async () => {
    const res = await fetch(`${API_URL}/establishments?page=1&limit=2`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.length).toBeLessThanOrEqual(2);
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(2);
  });

  it('should support filtering by name', async () => {
    const res = await fetch(`${API_URL}/establishments?name=Cafeteria`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeInstanceOf(Array);
  });
});

describe('GET /health', () => {
  it('should return 200 with OK status', async () => {
    const res = await fetch('http://localhost:3001/health');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('OK');
    expect(body.timestamp).toBeDefined();
  });
});
