import {
  HttpServer,
  INestApplication,
  NestApplicationOptions,
} from '@nestjs/common'
import { AbstractHttpAdapter } from '@nestjs/core'
import { TestingModule as BaseTestingModule } from '@nestjs/testing'
import { NuvixApplication } from '../application'

/**
 * Custom TestingModule to use NuvixApplication instead of the default NestApplication.
 */
export class TestingModule extends BaseTestingModule {
  override createNestApplication<T extends INestApplication = INestApplication>(
    serverOrOptions:
      | HttpServer
      | AbstractHttpAdapter
      | NestApplicationOptions
      | undefined,
    options?: NestApplicationOptions,
  ): T {
    const $this = this as any
    const [httpAdapter, appOptions] = $this.isHttpServer(serverOrOptions)
      ? [serverOrOptions, options]
      : [$this.createHttpAdapter(), serverOrOptions]

    $this.applyLogger(appOptions)
    $this.container.setHttpAdapter(httpAdapter)

    const instance = new NuvixApplication(
      $this.container,
      httpAdapter,
      $this.applicationConfig,
      $this.graphInspector,
      appOptions as any,
    )

    return $this.createAdapterProxy(instance, httpAdapter)
  }
}
