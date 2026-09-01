import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, '.output', 'public')
const bucket = process.env.MARKETING_S3_BUCKET
const distributionId = process.env.MARKETING_CLOUDFRONT_DISTRIBUTION_ID
const dryRun = process.argv.includes('--dry-run')

if (!existsSync(outputDir)) {
  console.error('Missing build output. Run pnpm build:marketing:static first.')
  process.exit(1)
}

if (!bucket) {
  console.error('Set MARKETING_S3_BUCKET before deploying.')
  process.exit(1)
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const syncArgs = ['s3', 'sync', outputDir, `s3://${bucket}`, '--delete']
if (dryRun) syncArgs.push('--dryrun')

console.log(dryRun ? 'Dry-run S3 sync:' : 'Syncing static marketing site to S3...')
run('aws', syncArgs)

if (distributionId && !dryRun) {
  console.log('Creating CloudFront invalidation...')
  run('aws', [
    'cloudfront',
    'create-invalidation',
    '--distribution-id',
    distributionId,
    '--paths',
    '/*'
  ])
}

console.log('Marketing static deploy complete.')
