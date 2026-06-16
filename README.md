# GrantFlow AI

GrantFlow AI is a Casper testnet MVP for milestone-based grant funding. A funder creates a grant, locks CSPR in escrow, a builder submits evidence, AI agents verify the milestone, and the funding agent releases payment while recording a transaction hash and reputation update.

## What Is Included

- `apps/web`: Next.js 15, TypeScript, Tailwind UI for the complete demo flow.
- `apps/api`: Express API with Prisma schema, agent orchestration, and Casper service boundary.
- `grant-escrow`: deployed Odra smart contract for the milestone escrow flow.
- `docker-compose.yml`: local PostgreSQL.

## Local Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run dev:api
npm run dev
```

The web app runs on `http://localhost:3000`; the API defaults to `http://localhost:4000`.

For Windows local demo mode, keep this in `apps/api/.env`:

```bash
CASPER_ONCHAIN_ENABLED=false
```

Set it to `true` only in an environment where `casper-client` and the authorized releaser secret key path are available.

## Demo Flow

1. Open the dashboard and create the "Deploy a working MVP" grant.
2. View the locked escrow state and milestone details.
3. Submit a GitHub repository URL and deployment URL.
4. Review the AI verification report.
5. Confirm the mocked Casper release transaction and reputation update.

## Full Local Workflow Test

Run the API first:

```bash
npm run dev:api
```

Run the frontend in a second terminal:

```bash
npm run dev
```

Then test:

1. Open `http://localhost:3000`.
2. Click **Connect Wallet**. If the Casper extension is not installed, the UI shows `Wallet missing`; the flow still works in local demo mode.
3. Open `http://localhost:3000/dashboard` and confirm indexed backend stats load.
4. Open `http://localhost:3000/grants/new`.
5. Create a grant. With `CASPER_ONCHAIN_ENABLED=false`, the API returns a deterministic `local-demo` transaction instead of calling `casper-client`.
6. Open the created grant details page.
7. Click **Submit evidence** and run verification.
8. Open the generated report.
9. Return to the grant details page and click **Release payment**.
10. Confirm the dashboard transaction history and report page show the release hash.

## Casper Testnet Deployment

- Deploy Hash:
  `758485e289bf2339f445a00012dcdcb2cc2f9641e2ff320708172dab0a39ceed`

- Contract Hash:
  `hash-127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f`

- Package Hash:
  `hash-3b795847d0b0dbc46a4e4b5f402e15a445b2ca33fc082480020e05686f181c52`

- Authorized Releaser:
  `account-hash-1130715646e6847e65732ba746ecad6fce0f33ba4ac6c9f4f021674cea2ab3a5`

- Network:
  Casper Testnet

## Casper Integration Notes

`apps/api/src/casper.ts` calls the deployed `GrantEscrow` contract through `casper-client` when `CASPER_CONTRACT_HASH` and `CASPER_SECRET_KEY` are configured. If those values are absent, the API returns deterministic local-demo hashes so the UI remains runnable without a funded signing wallet.

Integrated entry points:

- `POST /grants` -> `create_grant(grant_id, builder, amount)`
- `POST /payments/release` -> `release_payment(grant_id)`

Direct contract calls should target:

```text
hash-127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f
```

Do not commit `apps/api/.env`; it contains the authorized releaser secret key path.

For real `create_grant` calls, pass the builder as a Casper `account-hash-*` value.

## API Endpoints

- `POST /grants`
- `POST /grants/:id/accept`
- `POST /milestones/:id/submit`
- `POST /agents/verify`
- `POST /payments/release`
- `GET /grants`
- `GET /grants/:id`
- `GET /transactions`

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).
