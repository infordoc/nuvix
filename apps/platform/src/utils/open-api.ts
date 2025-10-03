import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { configuration } from '@nuvix/utils'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

export function openApiSetup(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('Nuvix Platform')
    .setDescription('The platform to manage your Nuvix projects')
    .setVersion('1.0')
    .addTag('nuvix', 'platform')
    .addGlobalParameters({
      name: 'X-Nuvix-Project',
      in: 'header',
      required: false,
      description: 'Project ID.',
      schema: {
        type: 'string',
      },
    })
    .addCookieAuth('session')
    .addGlobalResponse({
      status: '5XX',
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            description: 'Error code',
          },
          type: {
            type: 'string',
            description: 'Error type',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          version: {
            type: 'string',
            description: 'API version',
          },
        },
        required: ['code', 'type', 'message', 'version'],
      },
    })
    .build()

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    })

  const document = documentFactory()
  const path = configuration.assets.get('public', 'platform')

  try {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true })
    }
    writeFileSync(`${path}/open-api.json`, JSON.stringify(document, null, 2))
  } catch (error) {
    console.error('Error writing OpenAPI spec files:', error)
  }
}
