import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Exception } from '@nuvix/core/extend/exception'
import { apiReference } from '@scalar/nestjs-api-reference'

export function openApiSetup(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('Nuvix API')
    .setDescription('A powerful BaaS for your next project')
    .setVersion('1.0')
    .addTag('nuvix')
    .addGlobalParameters({
      name: 'x-project-id',
      in: 'header',
    })
    .addCookieAuth('session')
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
      type: Exception,
    })
    .build()
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    })
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerUiEnabled: true,
    raw: ['json'],
  })

  // TODO: ---------
  app.getHttpAdapter().get('/reference', (req, res) => {
    apiReference({
      content: documentFactory(),
      withFastify: true,
    })(req as any, res.raw as any)
  })
}
