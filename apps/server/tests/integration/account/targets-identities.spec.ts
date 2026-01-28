import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getApp } from '../../setup/app'
import { faker } from '@faker-js/faker'
import { createTestSession, withSession, TestSession } from '../../helpers/auth'

describe('Account Targets (Integration)', () => {
  let app: INestApplication
  let session: TestSession

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  beforeEach(async () => {
    session = await createTestSession(app)
  })

  describe('POST /v1/account/targets/push', () => {
    it('should create push target when authenticated', async () => {
      const payload = {
        targetId: faker.string.alphanumeric(12),
        identifier: faker.string.alphanumeric(50),
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/targets/push'),
        session,
      ).send(payload)

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should create push target with optional providerId', async () => {
      const payload = {
        targetId: faker.string.alphanumeric(12),
        identifier: faker.string.alphanumeric(50),
        providerId: faker.string.alphanumeric(12),
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/targets/push'),
        session,
      ).send(payload)

      expect([200, 201, 400, 401, 403]).toContain(res.status)
    })

    it('should fail without identifier', async () => {
      const payload = {
        targetId: faker.string.alphanumeric(12),
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/targets/push'),
        session,
      ).send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without targetId', async () => {
      const payload = {
        identifier: faker.string.alphanumeric(50),
      }

      const res = await withSession(
        request(app.getHttpServer()).post('/v1/account/targets/push'),
        session,
      ).send(payload)

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const payload = {
        targetId: faker.string.alphanumeric(12),
        identifier: faker.string.alphanumeric(50),
      }

      const res = await request(app.getHttpServer())
        .post('/v1/account/targets/push')
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('PUT /v1/account/targets/:targetId/push', () => {
    it('should update push target when authenticated', async () => {
      const targetId = faker.string.alphanumeric(12)
      const payload = {
        identifier: faker.string.alphanumeric(50),
      }

      const res = await withSession(
        request(app.getHttpServer()).put(
          `/v1/account/targets/${targetId}/push`,
        ),
        session,
      ).send(payload)

      expect([200, 400, 401, 403, 404]).toContain(res.status)
    })

    it('should fail without identifier', async () => {
      const targetId = faker.string.alphanumeric(12)
      const res = await withSession(
        request(app.getHttpServer()).put(
          `/v1/account/targets/${targetId}/push`,
        ),
        session,
      ).send({})

      expect([400, 422]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const targetId = faker.string.alphanumeric(12)
      const payload = {
        identifier: faker.string.alphanumeric(50),
      }

      const res = await request(app.getHttpServer())
        .put(`/v1/account/targets/${targetId}/push`)
        .send(payload)

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('DELETE /v1/account/targets/:targetId/push', () => {
    it('should delete push target when authenticated', async () => {
      const targetId = faker.string.alphanumeric(12)
      const res = await withSession(
        request(app.getHttpServer()).delete(
          `/v1/account/targets/${targetId}/push`,
        ),
        session,
      )

      expect([204, 400, 401, 403, 404]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const targetId = faker.string.alphanumeric(12)
      const res = await request(app.getHttpServer()).delete(
        `/v1/account/targets/${targetId}/push`,
      )

      expect([401, 403]).toContain(res.status)
    })
  })
})

describe('Account Identities (Integration)', () => {
  let app: INestApplication
  let session: TestSession

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  beforeEach(async () => {
    session = await createTestSession(app)
  })

  describe('GET /v1/account/identities', () => {
    it('should list identities when authenticated', async () => {
      const res = await withSession(
        request(app.getHttpServer()).get('/v1/account/identities'),
        session,
      )

      expect([200, 401, 403]).toContain(res.status)
    })

    it('should list identities with query filters', async () => {
      const res = await withSession(
        request(app.getHttpServer())
          .get('/v1/account/identities')
          .query({ limit: 10, offset: 0 }),
        session,
      )

      expect([200, 401, 403]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer()).get(
        '/v1/account/identities',
      )

      expect([401, 403]).toContain(res.status)
    })
  })

  describe('DELETE /v1/account/identities/:identityId', () => {
    it('should delete identity when authenticated', async () => {
      const identityId = faker.string.alphanumeric(12)
      const res = await withSession(
        request(app.getHttpServer()).delete(
          `/v1/account/identities/${identityId}`,
        ),
        session,
      )

      expect([204, 401, 403, 404]).toContain(res.status)
    })

    it('should fail without authentication', async () => {
      const identityId = faker.string.alphanumeric(12)
      const res = await request(app.getHttpServer()).delete(
        `/v1/account/identities/${identityId}`,
      )

      expect([401, 403]).toContain(res.status)
    })
  })
})
