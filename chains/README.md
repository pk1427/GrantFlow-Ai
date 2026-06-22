# Chain Adapters

GrantFlow is organized as a chain-agnostic protocol with one reference implementation today.

```text
chains/
├── casper/
│   └── contracts/grant-escrow/
├── base/
└── stellar/
```

## Current Status

- `casper`: live Casper Testnet reference implementation with deployed escrow contract.
- `base`: planned EVM settlement adapter.
- `stellar`: planned stablecoin/cross-border settlement adapter.

Backend settlement code lives in `apps/api/src/chains`. Contract sources live here under the matching chain directory.
