import { Module } from '@nestjs/common';
import { HookManager } from './hook.manager';
import { ProjectHook } from './project.hook';
import { AuthHook } from './auth.hook';
import { HostHook } from './host.hook';
import { ApiHook } from './api.hook';
import { ProjectUsageHook } from './project-usage.hook';
import { CorsHook } from './cors.hook';
import { HOOKS } from 'src/Utils/constants';

@Module({
  providers: [
    {
      provide: HOOKS,
      useFactory: (
        projectHook: ProjectHook,
        authHook: AuthHook,
        hostHook: HostHook,
        apiHook: ApiHook,
        projectUsageHook: ProjectUsageHook,
        corsHook: CorsHook,
      ) => [
        projectHook,
        hostHook,
        corsHook,
        authHook,
        apiHook,
        projectUsageHook,
      ],
      inject: [
        ProjectHook,
        AuthHook,
        HostHook,
        ApiHook,
        ProjectUsageHook,
        CorsHook,
      ],
    },
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
