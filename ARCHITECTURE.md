# Architecture

```mermaid
flowchart LR
  Funder[Funder] --> Web[Next.js Web App]
  Builder[Builder] --> Web
  Web --> API[Express API]
  API --> DB[(PostgreSQL + Prisma)]
  API --> Verify[Verification Agent]
  API --> Risk[Risk Agent]
  API --> Funding[Funding Agent]
  Funding --> Adapters[Settlement Adapters]
  Adapters --> Casper[Casper Testnet Contracts]
  Adapters -. planned .-> Base[Base Adapter]
  Adapters -. planned .-> Stellar[Stellar Adapter]
  API --> Notify[Notification Agent]
  Casper --> Indexer[Contract Event Indexer]
  Indexer --> DB
```

The MVP optimizes for one complete path while keeping the protocol structure chain-ready. The frontend presents the grant lifecycle; the API owns state, AI orchestration, settlement adapter calls, and transaction history. Casper is the live reference adapter today. Base and Stellar directories are reserved for future settlement implementations.

## Repository Layout

```text
apps/
  web/                    Next.js application
  api/                    Express API, agents, indexer-style state
    src/chains/           Backend settlement adapters
chains/
  casper/                 Live Casper reference implementation
    contracts/grant-escrow/
  base/                   Planned EVM adapter
  stellar/                Planned Stellar adapter
```
