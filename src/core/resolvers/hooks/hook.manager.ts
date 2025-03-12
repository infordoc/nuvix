import { Injectable, OnModuleInit } from '@nestjs/common';
import { FastifyInstance } from 'fastify';
import { Hook, Hooks } from './base.hook';
import { ProjectHook } from './project.hook';
import { AuthHook } from './auth.hook';
import { CorsHook } from './cors.hook';
import { HostHook } from './host.hook';
import { ApiHook } from './api.hook';
import { ProjectUsageHook } from './project-usage.hook';
import { HttpAdapterHost } from '@nestjs/core';

@Injectable()
export class HookManager implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly projectHook: ProjectHook,
    private readonly hostHook: HostHook,
    private readonly corsHook: CorsHook,
    private readonly authHook: AuthHook,
    private readonly apiHook: ApiHook,
    private readonly projectUsageHook: ProjectUsageHook,
  ) {}

  async onModuleInit() {
    const fastify =
      this.httpAdapterHost.httpAdapter.getInstance<FastifyInstance>();
    const instances: Hook[] = [
      this.projectHook,
      this.hostHook,
      this.corsHook,
      this.authHook,
      this.apiHook,
      this.projectUsageHook,
    ];

    const hooks: Hooks[] = [
      'onRequest',
      'preParsing',
      'preValidation',
      'preHandler',
      'preSerialization',
      'onSend',
      'onResponse',
      'onError',
      'onTimeout',
      'onReady',
      'onListen',
      'onClose',
      'preClose',
      'onRoute',
      'onRegister',
    ];

    hooks.forEach((hookName) => {
      instances.forEach((instance) => {
        const hookMethod = instance[hookName];
        if (hookMethod) {
          fastify.addHook(hookName, async (req, reply, ...args) => {
            if (hookMethod.constructor.name === 'AsyncFunction') {
              await hookMethod.call(instance, req, reply, ...args);
            } else {
              hookMethod.call(instance, req, reply, ...args);
            }
          });
        }
      });
    });
  }
}
