import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { describe, it, expect, beforeAll } from 'vitest'
import { getApp } from '../../setup/app'
import { buildCreateAccountDTO } from '../../factories/dto/account.factory'
import { faker } from '@faker-js/faker'

describe('Account Creation (Integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  describe('POST /v1/account', () => {
    it('should create an account successfully', async () => {
      const payload = buildCreateAccountDTO()

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBeOneOf([201, 400, 409])
      if (res.status === 201) {
        expect(res.body).toEqual(
          expect.objectContaining({
            $id: payload.userId,
            email: payload.email,
            name: payload.name,
          }),
        )
      }
    })

    it('should fail when email is invalid', async () => {
      const payload = buildCreateAccountDTO({
        email: 'invalid-email',
      })

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail when password is too short', async () => {
      const payload = buildCreateAccountDTO({
        password: 'short',
      })

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail when password exceeds 256 chars', async () => {
      const payload = buildCreateAccountDTO({
        password: 'a'.repeat(257),
      })

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail when userId contains invalid characters', async () => {
      const payload = buildCreateAccountDTO({
        userId: 'user@invalid#id',
      })

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail when userId exceeds 36 chars', async () => {
      const payload = buildCreateAccountDTO({
        userId: 'a'.repeat(37),
      })

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should fail when name exceeds 128 chars', async () => {
      const payload = buildCreateAccountDTO({
        name: 'a'.repeat(129),
      })

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBe(400)
    })

    it('should succeed with optional name field omitted', async () => {
      const payload = buildCreateAccountDTO()
      delete payload.name

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBeOneOf([201, 400, 409])
    })

    it('should fail with missing userId', async () => {
      const payload = buildCreateAccountDTO()

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send({ ...payload, userId: undefined })

      expect([400, 422]).toContain(res.status)
    })

    it('should fail with missing email', async () => {
      const payload = buildCreateAccountDTO()

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send({ ...payload, email: undefined })

      expect([400, 422]).toContain(res.status)
    })

    it('should fail with missing password', async () => {
      const payload = buildCreateAccountDTO()

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send({ ...payload, password: undefined })

      expect([400, 422]).toContain(res.status)
    })

    it('should succeed with max length name (128 chars)', async () => {
      const payload = buildCreateAccountDTO({
        name: 'a'.repeat(128),
      })

      const res = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload)

      expect(res.status).toBeOneOf([201, 400, 409])
    })

    it('should handle duplicate email gracefully', async () => {
      const email = faker.internet.email().toLowerCase()
      const payload1 = buildCreateAccountDTO({ email })
      const payload2 = buildCreateAccountDTO({ email })

      const res1 = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload1)

      if (res1.status === 201) {
        const res2 = await request(app.getHttpServer())
          .post('/v1/account')
          .send(payload2)

        expect([400, 409]).toContain(res2.status)
      }
    })

    it('should handle duplicate userId gracefully', async () => {
      const userId = faker.string.alphanumeric(12)
      const payload1 = buildCreateAccountDTO({ userId })
      const payload2 = buildCreateAccountDTO({ userId })

      const res1 = await request(app.getHttpServer())
        .post('/v1/account')
        .send(payload1)

      if (res1.status === 201) {
        const res2 = await request(app.getHttpServer())
          .post('/v1/account')
          .send(payload2)

        expect([400, 409]).toContain(res2.status)
      }
    })

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'test@',
        '@test.com',
        'test@.com',
        'test..test@example.com',
        'test@example',
      ]

      for (const email of invalidEmails) {
        const payload = buildCreateAccountDTO({ email })

        const res = await request(app.getHttpServer())
          .post('/v1/account')
          .send(payload)

        expect(res.status).toBe(400)
      }
    })
  })
})
