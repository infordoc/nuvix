import { beforeAll, afterAll } from 'vitest'
import { getApp, closeApp } from './test-app'

beforeAll(async () => {
  await getApp() // boot once globally
})

afterAll(async () => {
  await closeApp() // teardown once after all suites
})
