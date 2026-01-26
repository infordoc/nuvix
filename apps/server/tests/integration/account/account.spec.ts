import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { getApp } from '../../setup/app'
import { buildCreateAccountDTO } from '../../factories/dto/account.factory'

describe('Account (Integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  it('creates an account successfully', async () => {
    const payload = buildCreateAccountDTO()

    const res = await request(app.getHttpServer())
      .post('/v1/account')
      .send(payload)
      .expect(201)

    expect(res.body).toEqual(
      expect.objectContaining({
        $id: payload.userId,
        email: payload.email,
        name: payload.name,
      }),
    )
  })

  it('fails when email is invalid', async () => {
    const payload = buildCreateAccountDTO({
      email: 'invalid-email',
    })

    await request(app.getHttpServer())
      .post('/v1/account')
      .send(payload)
      .expect(400)
  })
})
