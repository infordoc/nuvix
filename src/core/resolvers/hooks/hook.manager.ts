import { Injectable, OnModuleInit } from '@nestjs/common';
import { FastifyInstance } from 'fastify';
import { BaseHook } from './base.hook';
import { ProjectHook } from './project.hook';
import { AuthHook } from './auth.hook';
import { CorsHook } from './cors.hook';
import { HostHook } from './host.hook';
import { ApiHook } from './api.hook';
import { ProjectUsageHook } from './project-usage.hook';

@Injectable()
export class HookManager implements OnModuleInit {
  constructor(
    private readonly projectHook: ProjectHook,
    private readonly hostHook: HostHook,
    private readonly corsHook: CorsHook,
    private readonly authHook: AuthHook,
    private readonly apiHook: ApiHook,
    private readonly projectUsageHook: ProjectUsageHook,
  ) {}

  async onModuleInit() {
    const fastify = global['fastifyInstance'] as FastifyInstance;
    const hooks: BaseHook[] = [
      this.projectHook,
      this.hostHook,
      this.corsHook,
      this.authHook,
      this.apiHook,
      this.projectUsageHook,
    ];

    hooks.forEach((hook) => {
      if ('runSync' in hook) {
        fastify.addHook(hook.hookName, ((req, reply, done, ...args) => {
          hook.runSync(req, reply, done, fastify, ...args);
        }) as any);
      } else {
        fastify.addHook(hook.hookName, (async (req, reply, ...args) => {
          await hook.run(req, reply, fastify, ...args);
        }) as any);
      }
    });
  }
}
