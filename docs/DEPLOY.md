# Deploy (Firebase App Hosting)

LightForge deploys the Next.js app with **Firebase App Hosting**.

| Item | Value |
|------|--------|
| Project | `lightforge-2cf3b` |
| Backend | `lightforge-app` |
| Region | `us-central1` |
| URL | https://lightforge-app--lightforge-2cf3b.us-central1.hosted.app |

## One-time setup

1. Push this repo to GitHub (`main`).
2. In [Firebase Console → App Hosting](https://console.firebase.google.com/project/lightforge-2cf3b/apphosting):
   - Open backend **lightforge-app**
   - Connect GitHub repo **ForgePS/LightForge**
   - Live branch: `main`
   - Root directory: `/`
   - Enable automatic rollouts
3. Add App Hosting authorized domain (Auth → Settings):
   - `lightforge-app--lightforge-2cf3b.us-central1.hosted.app`
4. Optional Stripe secrets:

```bash
firebase apphosting:secrets:set STRIPE_SECRET_KEY --project lightforge-2cf3b
firebase apphosting:secrets:grantaccess STRIPE_SECRET_KEY --backend lightforge-app --project lightforge-2cf3b
# Repeat for STRIPE_WEBHOOK_SECRET and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Then uncomment the secret env blocks in apphosting.yaml
```

## Roll out

**CLI deploy** (works without GitHub connected):

```bash
firebase deploy --only apphosting --project lightforge-2cf3b
```

After GitHub is connected, automatic rollouts on push to `main`:

```bash
firebase apphosting:rollouts:create lightforge-app --git-branch main --project lightforge-2cf3b
```

### pnpm / App Hosting notes

Cloud Build uses **pnpm 11** with strict build-script approval. This repo configures:

- `minimum-release-age=0` in `.npmrc` and `pnpm-workspace.yaml`
- `allowBuilds` in `pnpm-workspace.yaml` for `sharp`, `esbuild`, etc.
- `PNPM_CONFIG_FROZEN_LOCKFILE=false` in `apphosting.yaml` (pnpm 10 vs 11 lockfile differences)

## Local vs production Admin SDK

Production uses the App Hosting service account (ADC). Ensure it has roles:

- Cloud Datastore User / Firebase Admin SDK Administrator Service Agent
- Firebase Authentication Admin (for session cookies + member invites)

## CI

GitHub Actions [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs `pnpm install`, `tsc`, and `pnpm build` on PRs and pushes to `main`.
