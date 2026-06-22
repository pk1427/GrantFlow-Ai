# Casper Adapter

Casper is the current reference settlement implementation for GrantFlow.

- Contract source: `contracts/grant-escrow`
- Backend adapter: `../../apps/api/src/chains/casper.ts`
- Network: Casper Testnet
- Contract hash: `hash-127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f`

This adapter supports grant creation and payment release through the Casper JS SDK. Escrow deposits are handled through the Odra contract flow documented in the contract README.
