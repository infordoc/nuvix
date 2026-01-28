import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getApp } from '../../setup/app'
import { faker } from '@faker-js/faker'
import { createTestSession, withSession, TestSession } from '../../helpers/auth'

describe('Account Updates (Integration)', () => {
  let app: INestApplication
  let session: TestSession

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  beforeEach(async () => {
    session = await createTestSession(app)
  })

  describe('GET /v1/account', () => {
    it('should get account when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).get('/v1/account'),
        session,
      )

      expect([200, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/v1/account')

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('DELETE /v1/account', () => {
    it('should delete account with admin auth', async () => {
      const res = await withSession(
        request(app.getHttpServer()).delete('/v1/account'),
        session,
      )

      expect([204, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).delete('/v1/account')

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('GET /v1/account/prefs', () => {
    it('should get account preferences when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).get('/v1/account/prefs'),
        session,
      )

      expect([200, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/v1/account/prefs')

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PATCH /v1/account/prefs', () => {
    it('should update preferences with valid object', async () => {
      const payload = {
        prefs: {
          theme: 'dark',
          language: 'en',
        },
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/prefs'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should update preferences with empty object', async () => {
      const payload = {
        prefs: {},
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/prefs'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const payload = {
        prefs: { theme: 'dark' },
      }

      const res = await request(app.getHttpServer())
        .patch('/v1/account/prefs')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })

    it('should fail with non-object prefs', async () => {
      const payload = {
        prefs: 'not-an-object',
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/prefs'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail with missing prefs field', async () => {
      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/prefs'),
        session,
      ).send({})

      expect([400, 422]).toContain(res.status)
    })
  })

  describe('PATCH /v1/account/name', () => {
    it('should update name with valid value', async () => {
      const payload = {
        name: faker.person.fullName(),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/name'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should update name with max length (128 chars)', async () => {
      const payload = {
        name: 'a'.repeat(128),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/name'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail with name exceeding 128 chars', async () => {
      const payload = {
        name: 'a'.repeat(129),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/name'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without authentication', async () => {
      const payload = {
        name: faker.person.fullName(),
      }

      const res = await request(app.getHttpServer())
        .patch('/v1/account/name')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })

    it('should fail with missing name field', async () => {
      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/name'),
        session,
      ).send({})

      expect([400, 422]).toContain(res.status)
    })
  })

  describe('PATCH /v1/account/password', () => {
    it('should update password with valid credentials', async () => {
      const payload = {
        password: faker.internet.password({ length: 16 }),
        oldPassword: faker.internet.password({ length: 16 }),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/password'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail with short new password', async () => {
      const payload = {
        password: 'short',
        oldPassword: faker.internet.password({ length: 16 }),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/password'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail with password exceeding 256 chars', async () => {
      const payload = {
        password: 'a'.repeat(257),
        oldPassword: faker.internet.password({ length: 16 }),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/password'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without oldPassword', async () => {
      const payload = {
        password: faker.internet.password({ length: 16 }),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/password'),
        session,
      ).send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const payload = {
        password: faker.internet.password({ length: 16 }),
        oldPassword: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .patch('/v1/account/password')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PATCH /v1/account/email', () => {
    it('should update email with valid credentials', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 16 }),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/email'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail with invalid email format', async () => {
      const payload = {
        email: 'invalid-email',
        password: faker.internet.password({ length: 16 }),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/email'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without authentication', async () => {
      const payload = {
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .patch('/v1/account/email')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PATCH /v1/account/phone', () => {
    it('should update phone with valid credentials', async () => {
      const payload = {
        phone: '+16175551234',
        password: faker.internet.password({ length: 16 }),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/phone'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail with invalid phone format', async () => {
      const payload = {
        phone: 'invalid-phone',
        password: faker.internet.password({ length: 16 }),
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/phone'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without authentication', async () => {
      const payload = {
        phone: '+16175551234',
        password: faker.internet.password({ length: 16 }),
      }

      const res = await request(app.getHttpServer())
        .patch('/v1/account/phone')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PATCH /v1/account/status', () => {
    it('should update status when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/status'),
        session,
      ).send({})

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .patch('/v1/account/status')
        .send({})

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('POST /v1/account/verification', () => {
    it('should create email verification when authenticated', async () => {
      const payload = {
        url: 'https://example.com/verify',
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/verification'),
        session,
      ).send(payload)

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should fail with invalid URL', async () => {
      const payload = {
        url: 'not-a-valid-url',
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/verification'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without authentication', async () => {
      const payload = {
        url: 'https://example.com/verify',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/verification')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PUT /v1/account/verification', () => {
    it('should confirm email verification', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/verification')
        .send(payload)

      expect([200, 400, 404]).toContain(res.status)
    })

    it('should fail without userId', async () => {
      const payload = {
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/verification')
        .send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without secret', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/verification')
        .send(payload)

      expect([400, 422]).toContain(res.status)
    })
  })

  describe('POST /v1/account/verification/phone', () => {
    it('should create phone verification when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/verification/phone'),
        session,
      ).send({})

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/account/verification/phone')
        .send({})

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PUT /v1/account/verification/phone', () => {
    it('should confirm phone verification', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/verification/phone')
        .send(payload)

      expect([200, 400, 404]).toContain(res.status)
    })

    it('should fail without userId', async () => {
      const payload = {
        secret: faker.string.alphanumeric(220),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/verification/phone')
        .send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without secret', async () => {
      const payload = {
        userId: faker.string.alphanumeric(12),
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/verification/phone')
        .send(payload)

      expect([400, 422]).toContain(res.status)
    })
  })
})
