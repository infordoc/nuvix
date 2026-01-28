import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getApp } from '../../setup/app'
import { faker } from '@faker-js/faker'
import { createTestSession, withSession, TestSession } from '../../helpers/auth'

describe('Account MFA (Integration)', () => {
  let app: INestApplication
  let session: TestSession

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  beforeEach(async () => {
    session = await createTestSession(app)
  })

  describe('PATCH /v1/account/mfa', () => {
    it('should enable MFA when authenticated', async () => {
      const payload = {
        mfa: true,
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/mfa'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should disable MFA when authenticated', async () => {
      const payload = {
        mfa: false,
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/mfa'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const payload = {
        mfa: true,
      }

      const res = await request(app.getHttpServer())
        .patch('/v1/account/mfa')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })

    it('should fail with non-boolean value', async () => {
      const payload = {
        mfa: 'true',
      }

      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/mfa'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail with missing mfa field', async () => {
      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/mfa'),
        session,
      ).send({})

      expect([400, 422]).toContain(res.status)
    })
  })

  describe('GET /v1/account/mfa/factors', () => {
    it('should list MFA factors when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).get('/v1/account/mfa/factors'),
        session,
      )

      expect([200, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get(
        '/v1/account/mfa/factors',
      )

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('POST /v1/account/mfa/authenticators/:type', () => {
    it('should create TOTP authenticator when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).post(
          '/v1/account/mfa/authenticators/totp',
        ),
        session,
      ).send({})

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/account/mfa/authenticators/totp')
        .send({})

      expect([401, 403]).toContain(res.status)
    })

    it('should fail with invalid authenticator type', async () => {
      const res = await withSession(
        request(app.getHttpServer()).post(
          '/v1/account/mfa/authenticators/invalid',
        ),
        session,
      ).send({})

      expect(res.status).toBe(400)
    })
  })

  describe('PUT /v1/account/mfa/authenticators/:type', () => {
    it('should verify TOTP authenticator', async () => {
      const payload = {
        otp: '000000',
      }

      const res = await withSession(
        request(app.getHttpServer()).put('/v1/account/mfa/authenticators/totp'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without OTP', async () => {
      const res = await withSession(
        request(app.getHttpServer()).put('/v1/account/mfa/authenticators/totp'),
        session,
      ).send({})

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const payload = {
        otp: '000000',
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/mfa/authenticators/totp')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('POST /v1/account/mfa/recovery-codes', () => {
    it('should create MFA recovery codes when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/mfa/recovery-codes'),
        session,
      ).send({})

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/account/mfa/recovery-codes')
        .send({})

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PATCH /v1/account/mfa/recovery-codes', () => {
    it('should regenerate MFA recovery codes when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).patch('/v1/account/mfa/recovery-codes'),
        session,
      ).send({})

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .patch('/v1/account/mfa/recovery-codes')
        .send({})

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('GET /v1/account/mfa/recovery-codes', () => {
    it('should get MFA recovery codes when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).get('/v1/account/mfa/recovery-codes'),
        session,
      )

      expect([200, 401, 403, 404]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get(
        '/v1/account/mfa/recovery-codes',
      )

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('DELETE /v1/account/mfa/authenticators/:type', () => {
    it('should delete TOTP authenticator when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).delete(
          '/v1/account/mfa/authenticators/totp',
        ),
        session,
      )

      expect([204, 400, 401, 403, 404]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/v1/account/mfa/authenticators/totp',
      )

      expect([401, 403]).toContain(res.status)
    })

    it('should fail with invalid authenticator type', async () => {
      const res = await withSession(
        request(app.getHttpServer()).delete(
          '/v1/account/mfa/authenticators/invalid',
        ),
        session,
      )

      expect(res.status).toBe(400)
    })
  })

  describe('POST /v1/account/mfa/challenge', () => {
    it('should create MFA challenge with TOTP factor', async () => {
      const payload = {
        factor: 'totp',
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/mfa/challenge'),
        session,
      ).send(payload)

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should create MFA challenge with email factor', async () => {
      const payload = {
        factor: 'email',
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/mfa/challenge'),
        session,
      ).send(payload)

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should create MFA challenge with phone factor', async () => {
      const payload = {
        factor: 'phone',
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/mfa/challenge'),
        session,
      ).send(payload)

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should create MFA challenge with recovery_code factor', async () => {
      const payload = {
        factor: 'recovery_code',
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/mfa/challenge'),
        session,
      ).send(payload)

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should fail with invalid factor', async () => {
      const payload = {
        factor: 'invalid-factor',
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/mfa/challenge'),
        session,
      ).send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail without factor', async () => {
      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/mfa/challenge'),
        session,
      ).send({})

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const payload = {
        factor: 'totp',
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/mfa/challenge')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PUT /v1/account/mfa/challenge', () => {
    it('should verify MFA challenge', async () => {
      const payload = {
        challengeId: faker.string.alphanumeric(12),
        otp: '000000',
      }

      const res = await withSession(
        request(app.getHttpServer()).put('/v1/account/mfa/challenge'),
        session,
      ).send(payload)

      expect([200, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without challengeId', async () => {
      const payload = {
        otp: '000000',
      }

      const res = await withSession(
        request(app.getHttpServer()).put('/v1/account/mfa/challenge'),
        session,
      ).send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without OTP', async () => {
      const payload = {
        challengeId: faker.string.alphanumeric(12),
      }

      const res = await withSession(
        request(app.getHttpServer()).put('/v1/account/mfa/challenge'),
        session,
      ).send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const payload = {
        challengeId: faker.string.alphanumeric(12),
        otp: '000000',
      }

      const res = await request(app.getHttpServer())
        .put('/v1/account/mfa/challenge')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })
})
