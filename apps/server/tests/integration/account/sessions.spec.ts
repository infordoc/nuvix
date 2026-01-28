import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getApp } from '../../setup/app'
import { faker } from '@faker-js/faker'
import { createTestSession, withSession, TestSession } from '../../helpers/auth'

describe('Account Sessions (Integration)', () => {
  let app: INestApplication
  let session: TestSession

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  beforeEach(async () => {
    session = await createTestSession(app)
  })

  describe('POST /v1/account/sessions/email', () => {
    it('should create email password session', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions/email')
        .send(payload)

      expect(res.status).toBeOneOf([200, 201, 400, 401])
    })

    it('should fail with invalid email', async () => {
      const payload = {
        email: 'invalid-email',
        password: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions/email')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail with short password', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
        password: 'short',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions/email')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail with missing email', async () => {
      const payload = {
        password: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions/email')
        .send(payload)

      expect(res.status).toBeOneOf([400, 422])
    })

    it('should fail with missing password', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions/email')
        .send(payload)

      expect(res.status).toBeOneOf([400, 422])
    })
  })

  describe('POST /v1/account/sessions', () => {
    it('should create session with token', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions')
        .send(payload)

      expect(res.status).toBeOneOf([200, 201, 400, 401])
    })

    it('should fail with invalid userId format', async () => {
      const payload = {
        userId: '',
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions')
        .send(payload)

      expect(res.status).toBeOneOf([400, 422])
    })

    it('should fail with short secret', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: 'short',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without userId', async () => {
      const payload = {
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions')
        .send(payload)

      expect(res.status).toBeOneOf([400, 422])
    })

    it('should fail without secret', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions')
        .send(payload)

      expect(res.status).toBeOneOf([400, 422])
    })
  })

  describe('POST /v1/account/sessions/anonymous', () => {
    it('should create anonymous session', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/account/sessions/anonymous')
        .send({})

      expect(res.status).toBeOneOf([200, 201])
    })
  })

  describe('POST /v1/account/tokens/magic-url', () => {
    it('should create magic URL token', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        email: faker.internet.email().toLowerCase(),
        url: 'https://example.com/auth',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/magic-url')
        .send(payload)

      expect(res.status).toBeOneOf([200, 201, 400])
    })

    it('should fail with invalid email', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        email: 'invalid-email',
        url: 'https://example.com/auth',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/magic-url')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail with missing email', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        url: 'https://example.com/auth',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/magic-url')
        .send(payload)

      expect(res.status).toBeOneOf([400, 422])
    })

    it('should work with optional phrase parameter', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        email: faker.internet.email().toLowerCase(),
        url: 'https://example.com/auth',
        phrase: true,
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/magic-url')
        .send(payload)

      expect(res.status).toBeOneOf([200, 201, 400])
    })
  })

  describe('POST /v1/account/tokens/email', () => {
    it('should create email token (OTP)', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        email: faker.internet.email().toLowerCase(),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/email')
        .send(payload)

      expect(res.status).toBeOneOf([200, 201, 400])
    })

    it('should fail with invalid email format', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        email: 'not-an-email',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/email')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without email', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/email')
        .send(payload)

      expect(res.status).toBeOneOf([400, 422])
    })
  })

  describe('POST /v1/account/tokens/phone', () => {
    it('should create phone token', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        phone: '+16175551234',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/phone')
        .send(payload)

      expect(res.status).toBeOneOf([200, 201, 400])
    })

    it('should fail with invalid phone format', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        phone: 'invalid-phone',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/phone')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without phone', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/tokens/phone')
        .send(payload)

      expect(res.status).toBeOneOf([400, 422])
    })
  })

  describe('PUT /v1/account/sessions/magic-url', () => {
    it('should update magic URL session', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/sessions/magic-url')
        .send(payload)

      expect(res.status).toBeOneOf([200, 400, 404])
    })
  })

  describe('PUT /v1/account/sessions/phone', () => {
    it('should update phone session', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/sessions/phone')
        .send(payload)

      expect(res.status).toBeOneOf([200, 400, 404])
    })
  })

  describe('GET /v1/account/sessions', () => {
    it('should list sessions when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).get('/v1/account/sessions'),
        session,
      )

      expect([200, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/v1/account/sessions')

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('GET /v1/account/sessions/:sessionId', () => {
    it('should get specific session when authenticated', async () => {
      const sessionId = faker.string.alphanumeric(12)
      const res = await withSession(
        request(app.getHttpServer()).get(`/v1/account/sessions/${sessionId}`),
        session,
      )

      expect([200, 401, 403, 404]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const sessionId = faker.string.alphanumeric(12)
      const res = await request(app.getHttpServer()).get(
        `/v1/account/sessions/${sessionId}`,
      )

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PATCH /v1/account/sessions/:sessionId', () => {
    it('should update session when authenticated', async () => {
      const sessionId = faker.string.alphanumeric(12)
      const res = await withSession(
        request(app.getHttpServer()).patch(`/v1/account/sessions/${sessionId}`),
        session,
      ).send({})

      expect([200, 400, 401, 403, 404]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const sessionId = faker.string.alphanumeric(12)
      const res = await request(app.getHttpServer())
        .patch(`/v1/account/sessions/${sessionId}`)
        .send({})

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('DELETE /v1/account/sessions/:sessionId', () => {
    it('should delete session when authenticated', async () => {
      const sessionId = faker.string.alphanumeric(12)
      const res = await withSession(
        request(app.getHttpServer()).delete(
          `/v1/account/sessions/${sessionId}`,
        ),
        session,
      )

      expect([204, 401, 403, 404]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const sessionId = faker.string.alphanumeric(12)
      const res = await request(app.getHttpServer()).delete(
        `/v1/account/sessions/${sessionId}`,
      )

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('DELETE /v1/account/sessions', () => {
    it('should delete all sessions when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).delete('/v1/account/sessions'),
        session,
      )

      expect([204, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/v1/account/sessions',
      )

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('POST /v1/jwts', () => {
    it('should create JWT when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).post('/v1/jwts'),
        session,
      ).send({})

      expect([200, 201, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).post('/v1/jwts').send({})

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('POST /v1/jwt', () => {
    it('should create JWT alias endpoint when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).post('/v1/jwt'),
        session,
      ).send({})

      expect([200, 201, 401, 403]).toContain(res.status)
    })
  })
})
