import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { getApp } from './test-utils/test-app'
import { configuration } from '@nuvix/utils'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await getApp()
  }, 30000)

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(302)
      .expect('Location', configuration.app.consoleURL)
  })
})
