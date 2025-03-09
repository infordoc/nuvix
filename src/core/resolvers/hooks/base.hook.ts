import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from 'fastify';
import { ApplicationHook, LifecycleHook } from 'fastify/types/hooks';

export type Hooks = ApplicationHook | LifecycleHook;

export interface BaseHook {
  hookName: Hooks;

  /**
   * Runs the hook logic.
   * If it's a sync function, it should call `done()`.
   * If it's async, it should return a Promise.
   */
  run?(
    req: FastifyRequest,
    reply: FastifyReply,
    fastify: FastifyInstance,
    ...args: unknown[]
  ): Promise<void>;

  runSync?(
    req: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
    fastify: FastifyInstance,
    ...args: unknown[]
  ): void;
}
