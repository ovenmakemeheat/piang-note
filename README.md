# piang-note

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Astro, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Astro** - The web framework for content-driven websites
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser to see the web application.

## Deployment (Cloudflare via Alchemy)

- Target: web
- Dev: bun run dev
- Deploy: bun run deploy
- Destroy: bun run destroy

For more details, see the guide on [Deploying to Cloudflare with Alchemy](https://www.better-t-stack.dev/docs/guides/cloudflare-alchemy).

### GitHub Actions

The workflows are adapted from Alchemy's bundled GitHub Actions template and [Cloudflare's CI/CD guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).

- `.github/workflows/CI.yml` builds pull requests without deployment credentials. CD reuses the same checks.
- `.github/workflows/CD.yml` runs on pushes to `main` or a manual run. After CI passes, it deploys the `piang-note` app's `prod` stage through Alchemy, which builds the Cloudflare Worker and uploads its assets. Deployments run one at a time.
- Both workflows use Node.js 22 and the Bun version in `package.json`.

In **Settings → Environments**, create a `production` environment and restrict deployments to `main`. Add these environment secrets:

- `CLOUDFLARE_API_TOKEN`: use the **Edit Cloudflare Workers** token template, scoped to the target account. The deployment also provisions the state-store Worker and its SQLite Durable Object.
- `CLOUDFLARE_ACCOUNT_ID`: the target account ID.
- `ALCHEMY_PASSWORD`: a stable encryption password for production state.
- `ALCHEMY_STATE_TOKEN`: a stable, random state-store authentication token. If the account already uses Alchemy's default `alchemy-state-service`, reuse its token.

Credentials are only passed to the deployment step, never to pull-request builds.

CI uses [CloudflareStateStore](https://alchemy.run/guides/cloudflare-state-store/) so deployment state survives fresh runners. The first deployment creates `alchemy-state-service` and the production app resources. Normal development still uses the existing local `.alchemy` state. Keep both Alchemy secrets stable between deployments.

For a local deployment to the same production resources, set the same credentials plus `ALCHEMY_STATE_STORE=cloudflare`, then run:

```bash
cd packages/infra
bun run deploy --stage prod
```

Do not switch an existing production stage from local to remote state without migrating its state first; this workflow does not import or adopt existing resources. It targets `prod`, not the local `dev` stage. No custom domain is added by these workflows.

Local `.env*`, `.dev.vars*`, `.wrangler/`, `.alchemy/`, and `.astro/` files are ignored.

## Git Hooks and Formatting

- Format and lint fix: `bun run check`

## Project Structure

```
piang-note/
├── apps/
│   ├── web/         # Frontend application (Astro)
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run check-types`: Check TypeScript types across all apps
- `bun run check`: Run Biome formatting and linting
