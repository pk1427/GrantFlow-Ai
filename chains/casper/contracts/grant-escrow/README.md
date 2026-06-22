# GrantEscrow

Odra smart contract for the GrantFlow AI hackathon MVP. One `GrantEscrow` grant represents one milestone: a funder creates and funds it, then the backend-controlled authorized releaser releases escrowed CSPR to the builder after off-chain AI verification.

## Contract

Storage:

- `Mapping<u64, Grant>`
- `authorized_releaser: Address`

Entry points:

- `init(authorized_releaser: Address)`
- `create_grant(grant_id: u64, builder: Address, amount: U512)`
- `deposit_funds(grant_id: u64)` with attached CSPR
- `release_payment(grant_id: u64)`
- `get_grant(grant_id: u64) -> Grant`

## Verified Testnet Contract

- Contract hash: `hash-127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f`
- Package hash: `hash-3b795847d0b0dbc46a4e4b5f402e15a445b2ca33fc082480020e05686f181c52`
- Authorized releaser: `account-hash-1130715646e6847e65732ba746ecad6fce0f33ba4ac6c9f4f021674cea2ab3a5`

End-to-end proof on testnet:

- Create grant id 4: `58f2b21466609bc0349d7c847737e52df3ecfa8c0b51d08ab744bb9b8b9e646c`
- Deposit 100 CSPR: `7ec1a4d50275fd4635eb230620cf92eef49ea0ec75c07b66d196a83cf65a65eb`
- Release 100 CSPR: `3bf50064255462f3eda4dee7412d28cc41a1f4b0237e101ba410abde86a82649`

## Build and Test

```bash
rustup target add wasm32-unknown-unknown
cargo test
cargo build --release --target wasm32-unknown-unknown
```

Expected WASM:

```text
target/wasm32-unknown-unknown/release/grant_escrow.wasm
```

## Raw Contract Deployment

```bash
export CASPER_TESTNET_RPC_URL=https://node.testnet.casper.network/rpc
export CASPER_SECRET_KEY=$HOME/.casper/testnet/secret_key.pem
export CASPER_AUTHORIZED_RELEASER=account-hash-REPLACE_WITH_API_WALLET

casper-client put-deploy \
  --node-address "$CASPER_TESTNET_RPC_URL" \
  --secret-key "$CASPER_SECRET_KEY" \
  --chain-name casper-test \
  --payment-amount 30000000000 \
  --session-path target/wasm32-unknown-unknown/release/grant_escrow.wasm \
  --session-arg "authorized_releaser:account_hash='$CASPER_AUTHORIZED_RELEASER'"
```

Fetch the deploy and save the installed contract hash/package hash from the effects.

## Calling the Existing Deployment

A small Odra CLI wrapper is included at `src/bin/cli.rs`. It is needed for `deposit_funds` because the contract uses Odra attached value. Plain `casper-client put-deploy --session-hash deposit_funds` does not correctly attach Odra value.

Set Odra livenet env vars:

```bash
export ODRA_CASPER_LIVENET_NODE_ADDRESS=https://node.testnet.casper.network/rpc
export ODRA_CASPER_LIVENET_EVENTS_URL=https://node.testnet.casper.network/events
export ODRA_CASPER_LIVENET_CHAIN_NAME=casper-test
export ODRA_CASPER_LIVENET_SECRET_KEY_PATH=$HOME/.casper/api-wallet/secret_key.pem
```

The deployed package is already recorded in `resources/deployed_contracts.toml`.

Create grant through raw `casper-client`:

```bash
casper-client put-deploy \
  --node-address https://node.testnet.casper.network/rpc \
  --secret-key "$ODRA_CASPER_LIVENET_SECRET_KEY_PATH" \
  --chain-name casper-test \
  --payment-amount 30000000000 \
  --session-hash 127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f \
  --session-entry-point create_grant \
  --session-arg "grant_id:u64='4'" \
  --session-arg "builder:key='account-hash-1130715646e6847e65732ba746ecad6fce0f33ba4ac6c9f4f021674cea2ab3a5'" \
  --session-arg "amount:u512='100000000000'"
```

Deposit funds through the Odra proxy wrapper:

```bash
cargo run --bin cli -- \
  --contracts-toml resources/deployed_contracts.toml \
  contract GrantEscrow deposit_funds \
  --grant_id 4 \
  --attached_value '100 cspr' \
  --gas '30 cspr'
```

Release payment through raw `casper-client` or the API:

```bash
casper-client put-deploy \
  --node-address https://node.testnet.casper.network/rpc \
  --secret-key "$ODRA_CASPER_LIVENET_SECRET_KEY_PATH" \
  --chain-name casper-test \
  --payment-amount 30000000000 \
  --session-hash 127b6b05fc907d751f8672f71e9e0f1423b5ed62549c333ccadf91a6880ec81f \
  --session-entry-point release_payment \
  --session-arg "grant_id:u64='4'"
```

Query grant state:

```bash
cargo run --bin cli -- \
  --contracts-toml resources/deployed_contracts.toml \
  contract GrantEscrow get_grant \
  --grant_id 4
```

Expected final state after a complete flow: `funded=true`, `released=true`.

## Backend Notes

The Express API calls this contract through `apps/api/src/chains/casper.ts`. The default path uses the Casper JS SDK with `CASPER_SECRET_KEY_PEM_BASE64`, so hosted Node environments do not need a local `casper-client` binary for `create_grant` and `release_payment`.

The `casper-client` fallback remains available for local debugging with `CASPER_CALL_MODE=client`.
