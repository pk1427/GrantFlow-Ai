# GrantFlow AI

GrantFlow AI is a Casper testnet MVP for milestone-based grant funding. A funder creates a grant, locks CSPR in escrow, a builder submits evidence, AI agents verify the milestone, and the funding agent releases payment while recording a transaction hash and reputation update.

## What Is Included

- `apps/web`: Next.js 15, TypeScript, Tailwind UI for the complete demo flow.
- `apps/api`: Express API with Prisma schema, agent orchestration, and Casper service boundary.
- `contracts`: Odra-style Rust contract sources for `GrantFactory`, `GrantEscrow`, and `ReputationRegistry`.
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

## Demo Flow

1. Open the dashboard and create the "Deploy a working MVP" grant.
2. View the locked escrow state and milestone details.
3. Submit a GitHub repository URL and deployment URL.
4. Review the AI verification report.
5. Confirm the mocked Casper release transaction and reputation update.

## Casper Integration Notes

`apps/api/src/casper.ts` contains the production integration boundary. The MVP returns deterministic testnet-shaped hashes when `CASPER_*` contract hashes or signing keys are not configured, so the hackathon demo remains runnable locally.

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
