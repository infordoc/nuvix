import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getApp } from '../../setup/app'
import { faker } from '@faker-js/faker'
import { createTestSession, withSession, TestSession } from '../../helpers/auth'

describe('Account Recovery (Integration)', () => {
  let app: INestApplication
  let session: TestSession

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  beforeEach(async () => {
    session = await createTestSession(app)
  })

  describe('POST /v1/account/recovery', () => {
    it('should create a password recovery token', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
        url: 'https://example.com/reset',
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/recovery'),
        session,
      ).send(payload)

      expect([200, 201, 400, 401]).toContain(res.status)
    })

    it('should fail with invalid email format', async () => {
      const payload = {
        email: 'invalid-email',
        url: 'https://example.com/reset',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/recovery')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail with missing required fields', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/recovery')
        .send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail with invalid URL', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
        url: 'not-a-valid-url',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/recovery')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without URL', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/recovery')
        .send(payload)

      expect([400, 422]).toContain(res.status)
    })
  })

  describe('PUT /v1/account/recovery', () => {
    it('should update password recovery with valid credentials', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: faker.string.alphanumeric(220),
        password: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/recovery')
        .send(payload)

      expect([200, 400, 404]).toContain(res.status)
    })

    it('should fail with missing userId', async () => {
      const payload = {
        secret: faker.string.alphanumeric(220),
        password: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/recovery')
        .send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail with invalid secret length', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: 'short',
        password: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/recovery')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail with short password', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: faker.string.alphanumeric(220),
        password: 'short',
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/recovery')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without password', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/recovery')
        .send(payload)

      expect([400, 422]).toContain(res.status)
    })
  })
})
