import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { FastifyInstance } from 'fastify';
import { AsyncHook, Hook, Hooks, SyncHook } from './base.hook';
import { HttpAdapterHost } from '@nestjs/core';
import { HOOKS } from 'src/Utils/constants';

@Injectable()
export class HookManager implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(HOOKS) private readonly hooks: Hook[],
  ) {}

  async onModuleInit() {
    const fastify =
      this.httpAdapterHost.httpAdapter.getInstance<FastifyInstance>();

    const lifecycleHooks: Hooks[] = [
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

    lifecycleHooks.forEach((hookName) => {
      this.hooks.forEach((instance) => {
        const hookMethod = instance[hookName];
        if (hookMethod) {
          fastify.addHook(hookName, async (req, reply, ...args) => {
            try {
              if (hookMethod.constructor.name === 'AsyncFunction') {
                await (hookMethod as AsyncHook).call(
                  instance,
                  req,
                  reply,
                  ...args,
                );
              } else {
                (hookMethod as SyncHook).call(instance, req, reply, ...args);
              }
            } catch (error) {
              console.error(`Error in ${hookName} hook:`, error);
            }
          });
        }
      });
    });
  }
}
