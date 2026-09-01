import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const result = spawnSync('pnpm', ['exec', 'nuxt', 'build'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NITRO_PRESET: 'static'
  }
})

process.exit(result.status ?? 1)
