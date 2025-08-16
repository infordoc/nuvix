import { defineConfig, Format } from 'tsup'
import fs from 'fs'
import path from 'path'

interface NestProject {
    type: 'application' | 'library'
    root: string
    entryFile: string
    sourceRoot: string
    compilerOptions: {
        tsConfigPath: string
    }
}

interface NestConfig {
    projects: Record<string, NestProject>
}

// Read nest-cli.json with error handling
function readNestConfig(): NestConfig {
    try {
        const configPath = path.resolve('nest-cli.json')
        if (!fs.existsSync(configPath)) {
            throw new Error('nest-cli.json not found')
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    } catch (error) {
        console.error('Error reading nest-cli.json:', error)
        process.exit(1)
    }
}

const nestConfig = readNestConfig()

const projects = Object.entries(nestConfig.projects).map(([name, proj]) => {
    const isLib = proj.type === 'library'
    const entry = path.resolve(proj.sourceRoot, `${proj.entryFile}.ts`)
    const outDir = path.resolve(proj.root, 'dist')
    const tsconfig = path.resolve(proj.compilerOptions.tsConfigPath)

    if (!fs.existsSync(entry)) {
        console.warn(`Warning: Entry file not found for ${name}: ${entry}`)
    }

    return defineConfig({
        name,
        entry: [entry],
        outDir,
        format: isLib ? (['esm', 'cjs'] as Format[]) : (['esm'] as Format[]),
        target: 'node22',
        platform: 'node',
        splitting: false,
        sourcemap: true,
        clean: true,
        minify: false,
        dts: isLib,
        tsconfig,
        shims: false,
        treeshake: true,
    })
})

export default projects
