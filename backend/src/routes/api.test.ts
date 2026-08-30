import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Express API Integration Tests', () => {
  it('GET /api/health should return ok status and environment metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.environment).toBeDefined();
  });

  it('POST /api/auth/demo-login should generate isolated demo session and cookie', async () => {
    const res = await request(app).post('/api/auth/demo-login');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isDemo).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('GET /api/emails should require authentication', async () => {
    const res = await request(app).get('/api/emails');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_REQUIRED');
  });

  it('GET /api/emails with demo session should return seeded inbox messages', async () => {
    // 1. Log in as demo
    const loginRes = await request(app).post('/api/auth/demo-login');
    const cookie = loginRes.headers['set-cookie'];

    // 2. Fetch inbox with cookie
    const emailsRes = await request(app)
      .get('/api/emails?folder=inbox')
      .set('Cookie', cookie);

    expect(emailsRes.status).toBe(200);
    expect(emailsRes.body.success).toBe(true);
    expect(Array.isArray(emailsRes.body.data)).toBe(true);
    expect(emailsRes.body.data.length).toBeGreaterThan(0);
  });
});
