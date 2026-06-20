# GrantFlow AI

GrantFlow AI is a Casper testnet MVP for milestone-based grant funding. A funder creates a grant, CSPR is escrowed on-chain, a builder submits evidence, verification agents inspect the work, and an authorized release wallet calls the Casper contract to release payment.

## What Is Included

- `apps/web`: Next.js 15, TypeScript, Tailwind UI for grant creation, evidence submission, reports, and release status.
- `apps/api`: Express API with verification agents and Casper JS SDK calls for create/release.
- `grant-escrow`: Odra smart contract plus a small Odra CLI wrapper used for attached-value escrow deposits.
- `docker-compose.yml`: local PostgreSQL.

## Verified Casper Testnet Deployment

- Deploy hash: `758485e289bf2339f445a00012dcdcb2cc2f9641e2ff320708172dab0a39ceed`
- Contract hash: `hash-127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f`
- Package hash: `hash-3b795847d0b0dbc46a4e4b5f402e15a445b2ca33fc082480020e05686f181c52`
- Authorized releaser/API wallet: `account-hash-1130715646e6847e65732ba746ecad6fce0f33ba4ac6c9f4f021674cea2ab3a5`
- Network: `casper-test`

Final end-to-end test on Casper testnet:

- Grant: `grant-004` / on-chain id `4`
- Create deploy: `58f2b21466609bc0349d7c847737e52df3ecfa8c0b51d08ab744bb9b8b9e646c`
- Deposit deploy: `7ec1a4d50275fd4635eb230620cf92eef49ea0ec75c07b66d196a83cf65a65eb`
- Release deploy: `3bf50064255462f3eda4dee7412d28cc41a1f4b0237e101ba410abde86a82649`
- Final contract state: `funded=true`, `released=true`, amount `100000000000` motes.

## Local Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run dev:api
npm run dev
```

The web app runs on `http://localhost:3000`. The API is configured for `http://localhost:4001` in this repo.

For local demo mode without Casper calls, set this in `apps/api/.env`:

```bash
CASPER_ONCHAIN_ENABLED=false
```

For live testnet mode, set `CASPER_SECRET_KEY_PEM_BASE64` from the funded authorized releaser key. The API uses the Casper JS SDK by default, so hosted Node environments do not need `casper-client`.

## Environment Variables

### Frontend on Vercel

Set these in the Vercel project for `apps/web`:

```bash
NEXT_PUBLIC_API_URL=https://YOUR_API_HOST
NEXT_PUBLIC_CASPER_NETWORK=casper-test
NEXT_PUBLIC_CASPER_CONTRACT_HASH=hash-127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f
```

Vercel build settings for the web app:

```text
Root Directory: apps/web
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### API Runtime

The API uses `casper-js-sdk` by default and signs deploys from `CASPER_SECRET_KEY_PEM_BASE64`. This works on normal Node hosts such as Render, Koyeb, Fly.io, Railway, or a VPS.

```bash
PORT=4001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/grantflow?schema=public
CASPER_TESTNET_RPC_URL=https://node.testnet.casper.network/rpc
CASPER_CONTRACT_HASH=hash-127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f
CASPER_CONTRACT_PACKAGE_HASH=hash-3b795847d0b0dbc46a4e4b5f402e15a445b2ca33fc082480020e05686f181c52
CASPER_AUTHORIZED_RELEASER=account-hash-1130715646e6847e65732ba746ecad6fce0f33ba4ac6c9f4f021674cea2ab3a5
CASPER_CALL_MODE=sdk
CASPER_SECRET_KEY_PEM_BASE64=base64_encoded_secret_key_pem
CASPER_PAYMENT_AMOUNT=30000000000
CASPER_ONCHAIN_ENABLED=true
CASPER_ONCHAIN_TESTNET_ENABLED=true
GITHUB_TOKEN=optional_for_higher_rate_limits
```

Do not commit real secret keys or private-key contents.

Create the base64 secret from WSL:

```bash
base64 -w 0 ~/.casper/api-wallet/secret_key.pem
```

To force the old local binary path for debugging, set `CASPER_CALL_MODE=client`, `CASPER_SECRET_KEY=/path/to/secret_key.pem`, and make sure `casper-client` is installed.

## Backend Deployment

This repo includes a root `Dockerfile` and `railway.json` for deploying only the Express API. The Docker image builds `apps/api` and starts `npm run start --workspace @grantflow/api`.

Required backend variables:

```bash
PORT=4001
CASPER_TESTNET_RPC_URL=https://node.testnet.casper.network/rpc
CASPER_CONTRACT_HASH=hash-127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f
CASPER_CONTRACT_PACKAGE_HASH=hash-3b795847d0b0dbc46a4e4b5f402e15a445b2ca33fc082480020e05686f181c52
CASPER_AUTHORIZED_RELEASER=account-hash-1130715646e6847e65732ba746ecad6fce0f33ba4ac6c9f4f021674cea2ab3a5
CASPER_CALL_MODE=sdk
CASPER_SECRET_KEY_PEM_BASE64=base64_encoded_api_wallet_secret_key_pem
CASPER_PAYMENT_AMOUNT=30000000000
CASPER_ONCHAIN_ENABLED=true
CASPER_ONCHAIN_TESTNET_ENABLED=true
```

After deploy, test:

```bash
curl https://YOUR_API_DOMAIN/health
curl https://YOUR_API_DOMAIN/config
```

Use the API domain as `NEXT_PUBLIC_API_URL` when deploying the frontend on Vercel.

## Demo Flow

1. Create a grant from the UI. The API calls `create_grant(grant_id, builder, amount)` on Casper.
2. Deposit escrow funds. With the current contract, attached CSPR must be sent through Odra's proxy call, documented in `grant-escrow/README.md`.
3. Submit a GitHub repository URL and deployment URL.
4. The API verifies repository accessibility, commit count, README, recency, deployment health, and risk.
5. Click release payment. The API calls `release_payment(grant_id)` through the Casper JS SDK.
6. Confirm the deploy hash on CSPR.live and check the report/dashboard.

## Casper Client vs SDK

The API now uses the Casper JS SDK by default (`CASPER_CALL_MODE=sdk`). This is the deploy-friendly path because it signs from environment secrets and submits deploys directly over RPC.

The previous `casper-client` path is still available with `CASPER_CALL_MODE=client` for local debugging. The Odra CLI wrapper in `grant-escrow` is still useful for the separate attached-value escrow deposit because that contract call needs value transfer behavior that was already proven end-to-end on testnet.

## API Endpoints

- `GET /health`
- `GET /config`
- `GET /indexer/state`
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
