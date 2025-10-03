import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js'
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin/visitors/readonly.visitor.js'
import * as fs from 'fs'
import path from 'path'

const outputFile = path.resolve('apps/platform/src/metadata.ts')

const generator = new PluginMetadataGenerator()
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      dtoFileNameSuffix: ['.dto.ts', '.model.ts'],
      classTransformerShim: true,
      classValidatorShim: true,
      introspectComments: true,
      pathToSource: 'apps/platform/src',
      esmCompatible: true,
    }),
  ],
  outputDir: 'apps/platform/src',
  watch: false,
  tsconfigPath: 'apps/platform/tsconfig.app.json',
})

// --- Post-process step ---
let content = fs.readFileSync(outputFile, 'utf8')

// Replace `@nuvix/db/dist` with clean `@nuvix/db`
content = content
  .replace(/@nuvix\/db\/dist\//g, '@nuvix/db/')
  .replace(/@nuvix\/db\/dist\b/g, '@nuvix/db')

fs.writeFileSync(outputFile, content, 'utf8')
console.log(`✔ Metadata imports cleaned: ${outputFile}`)
