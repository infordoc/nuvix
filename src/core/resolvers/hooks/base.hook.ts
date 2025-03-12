import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from 'fastify';
import { ApplicationHook, LifecycleHook } from 'fastify/types/hooks';

export type Hooks = ApplicationHook | LifecycleHook;

export type AsyncHook<T = void> = (
  req: FastifyRequest,
  reply: FastifyReply,
  ...args: T[]
) => Promise<void>;
export type SyncHook<T = void> = (
  req: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
  ...args: T[]
) => void;

export type LifecycleHookMethods = {
  onRequest: AsyncHook | SyncHook;
  preParsing: AsyncHook<{ payload: any }> | SyncHook<{ payload: any }>;
  preValidation: AsyncHook | SyncHook;
  preHandler: AsyncHook | SyncHook;
  preSerialization: AsyncHook<{ payload: any }> | SyncHook<{ payload: any }>;
  onSend: AsyncHook<{ payload: any }> | SyncHook<{ payload: any }>;
  onResponse: AsyncHook | SyncHook;
  onError: AsyncHook<{ error: Error }> | SyncHook<{ error: Error }>;
  onTimeout: AsyncHook | SyncHook;
  onReady: AsyncHook | SyncHook;
  onListen: AsyncHook | SyncHook;
  onClose:
    | AsyncHook<{ instance: FastifyInstance }>
    | SyncHook<{ instance: FastifyInstance }>;
  preClose:
    | AsyncHook<{ instance: FastifyInstance }>
    | SyncHook<{ instance: FastifyInstance }>;
  onRoute:
    | AsyncHook<{ opts: Record<string, any> }>
    | SyncHook<{ opts: Record<string, any> }>;
  onRegister:
    | AsyncHook<{ instance: FastifyInstance; opts: Record<string, any> }>
    | SyncHook<{ instance: FastifyInstance; opts: Record<string, any> }>;
};

export interface Hook extends Partial<LifecycleHookMethods> {}
