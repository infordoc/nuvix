import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from 'fastify';
import { ApplicationHook, LifecycleHook } from 'fastify/types/hooks';

export type Hooks = ApplicationHook | LifecycleHook;

export type LifecycleHookMethods = {
  onRequest:
    | ((req: FastifyRequest, reply: FastifyReply) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => void);
  preParsing:
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        payload: any,
      ) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        payload: any,
        done: HookHandlerDoneFunction,
      ) => void);
  preValidation:
    | ((req: FastifyRequest, reply: FastifyReply) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => void);
  preHandler:
    | ((req: FastifyRequest, reply: FastifyReply) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => void);
  preSerialization:
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        payload: any,
      ) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        payload: any,
        done: HookHandlerDoneFunction,
      ) => void);
  onSend:
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        payload: any,
      ) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        payload: any,
        done: HookHandlerDoneFunction,
      ) => void);
  onResponse:
    | ((req: FastifyRequest, reply: FastifyReply) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => void);
  onError:
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        error: Error,
      ) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        error: Error,
        done: HookHandlerDoneFunction,
      ) => void);
  onTimeout:
    | ((req: FastifyRequest, reply: FastifyReply) => Promise<void>)
    | ((
        req: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => void);
  onReady: (() => Promise<void>) | ((done: HookHandlerDoneFunction) => void);
  onListen: (() => Promise<void>) | ((done: HookHandlerDoneFunction) => void);
  onClose:
    | ((instance: FastifyInstance) => Promise<void>)
    | ((instance: FastifyInstance, done: HookHandlerDoneFunction) => void);
  preClose:
    | ((instance: FastifyInstance) => Promise<void>)
    | ((instance: FastifyInstance, done: HookHandlerDoneFunction) => void);
  onRoute:
    | ((opts: Record<string, any>) => void)
    | ((opts: Record<string, any>, done: HookHandlerDoneFunction) => void);
  onRegister:
    | ((instance: FastifyInstance, opts: Record<string, any>) => Promise<void>)
    | ((
        instance: FastifyInstance,
        opts: Record<string, any>,
        done: HookHandlerDoneFunction,
      ) => void);
};

export interface Hook extends Partial<LifecycleHookMethods> {}
