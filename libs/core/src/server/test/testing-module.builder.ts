import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface.js'
import { GraphInspector } from '@nestjs/core'
import { NoopGraphInspector } from '@nestjs/core/inspector/noop-graph-inspector.js'
import {
  UuidFactory,
  UuidFactoryMode,
} from '@nestjs/core/inspector/uuid-factory.js'
import { DependenciesScanner } from '@nestjs/core/scanner.js'
import { TestingModuleBuilder as BaseTestingModuleBuilder } from '@nestjs/testing'
import { TestingModule } from './testing-module'

/**
 * Custom TestingModuleBuilder to use NuvixApplication and GraphInspector
 * instead of the default NestApplication.
 */
export class TestingModuleBuilder extends BaseTestingModuleBuilder {
  override async compile(
    options?: Pick<NestApplicationContextOptions, 'snapshot' | 'preview'>,
  ): Promise<TestingModule> {
    const $this = this as any

    $this.applyLogger()

    let graphInspector: GraphInspector
    if (options?.snapshot) {
      graphInspector = new GraphInspector($this.container)
      UuidFactory.mode = UuidFactoryMode.Deterministic
    } else {
      graphInspector = NoopGraphInspector
      UuidFactory.mode = UuidFactoryMode.Random
    }

    const scanner = new DependenciesScanner(
      $this.container,
      $this.metadataScanner,
      graphInspector,
      $this.applicationConfig,
    )
    await scanner.scan($this.module, {
      overrides: $this.getModuleOverloads(),
    })

    $this.applyOverloadsMap()
    await $this.createInstancesOfDependencies(graphInspector, options)
    scanner.applyApplicationProviders()

    const root = $this.getRootModule()
    return new TestingModule(
      $this.container,
      graphInspector,
      root,
      $this.applicationConfig,
    )
  }
}
