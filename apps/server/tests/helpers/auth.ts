import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { faker } from '@faker-js/faker'

export interface TestSession {
  sessionId: string
  userId: string
  cookies: string[]
}

export async function createTestSession(
  app: INestApplication,
): Promise<TestSession> {
  const email = faker.internet.email().toLowerCase()
  const password = faker.internet.password({ length: 16 })

  const createRes = await request(app.getHttpServer())
    .post('/v1/account')
    .send({
      userId: faker.string.alphanumeric(12),
      email,
      password,
      name: faker.person.fullName(),
    })

  if (createRes.status !== 201) {
    throw new Error(`Failed to create account: ${createRes.status}`)
  }

  const userId = createRes.body.$id

  const sessionRes = await request(app.getHttpServer())
    .post('/v1/account/sessions/email')
    .send({
      email,
      password,
    })

  if (![200, 201].includes(sessionRes.status)) {
    throw new Error(`Failed to create session: ${sessionRes.status}`)
  }

  const cookies = (sessionRes.headers['set-cookie'] || []) as string[]
  const sessionId = sessionRes.body.token

  return {
    sessionId,
    userId,
    cookies,
  }
}

export function withSession(
  req: request.Test,
  session: TestSession,
): request.Test {
  if (session.cookies.length > 0) {
    return req.set('Cookie', session.cookies)
  }

  if (session.sessionId) {
    return req.set('X-Nuvix-Session', session.sessionId)
  }

  return req
}
