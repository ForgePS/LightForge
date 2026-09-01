import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, '.output', 'public')

function readMarketingPaths() {
  const routesFile = join(root, 'data', 'routes.ts')
  const content = readFileSync(routesFile, 'utf8')
  const paths = [...content.matchAll(/path:\s*'([^']+)'/g)].map(match => match[1])
  return [...paths, '/sitemap.xml', '/robots.txt']
}

function expectedOutputPath(routePath) {
  if (routePath === '/') return join(outputDir, 'index.html')
  if (routePath.endsWith('.xml') || routePath.endsWith('.txt')) {
    return join(outputDir, routePath.slice(1))
  }
  return join(outputDir, routePath.slice(1), 'index.html')
}

if (!existsSync(outputDir)) {
  console.error('Missing build output. Run pnpm build:marketing (or build:static) first.')
  process.exit(1)
}

const missing = readMarketingPaths().filter(path => !existsSync(expectedOutputPath(path)))

if (missing.length) {
  console.error('Missing prerendered routes:')
  for (const path of missing) console.error(`  - ${path}`)
  process.exit(1)
}

console.log(`Validated ${readMarketingPaths().length} marketing routes in ${outputDir}`)
