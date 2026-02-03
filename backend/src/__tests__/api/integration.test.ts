/**
 * API 통합 테스트 (supertest).
 * DB가 떠 있어야 /health 등이 기대값으로 동작합니다.
 */
import request from 'supertest';
import { app } from '../../app';

describe('API Integration', () => {
  describe('GET /health', () => {
    it('returns json with ok and db', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBeLessThan(500);
      expect(res.body).toHaveProperty('ok');
      expect(res.body).toHaveProperty('db');
      if (res.body.ok) {
        expect(res.body.db).toBe('healthy');
      } else {
        expect(res.body.db).toBe('unhealthy');
      }
    });
  });

  describe('GET /api/posts', () => {
    it('returns 200 and list shape (optionalAuth)', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('posts');
      expect(Array.isArray(res.body.posts)).toBe(true);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without Authorization', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 when body is empty', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('returns 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrong' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('404', () => {
    it('returns 404 for unknown path', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Not Found');
    });
  });
});
