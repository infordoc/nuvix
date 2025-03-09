import { Module } from '@nestjs/common';
import { HookManager } from './hook.manager';
import { ProjectHook } from './project.hook';
import { AuthHook } from './auth.hook';
import { HostHook } from './host.hook';
import { ApiHook } from './api.hook';
import { ProjectUsageHook } from './project-usage.hook';
import { CorsHook } from './cors.hook';

@Module({
  providers: [
    HookManager,
    ProjectHook,
    AuthHook,
    HostHook,
    ApiHook,
    ProjectUsageHook,
    CorsHook,
  ],
  exports: [HookManager],
})
export class HookModule {}
