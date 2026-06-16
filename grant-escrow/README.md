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

## Install Dependencies

```bash
rustup target add wasm32-unknown-unknown
cargo install odra-cli
```

## Run Tests

```bash
cargo test
```

## Build Contract

```bash
cargo build --release --target wasm32-unknown-unknown
```

Expected output:

```text
target/wasm32-unknown-unknown/release/grant_escrow.wasm
```

## Casper Testnet Deployment

Set deployment values:

```bash
export CASPER_TESTNET_RPC_URL="https://node.testnet.casper.network/rpc"
export CASPER_SECRET_KEY="$HOME/.casper/keys/grantflow/secret_key.pem"
export CASPER_AUTHORIZED_RELEASER="account-hash-REPLACE_WITH_EXPRESS_API_WALLET"
```

Fund the deployer wallet with testnet CSPR:

```bash
casper-client get-account-info \
  --node-address "$CASPER_TESTNET_RPC_URL" \
  --public-key "$(casper-client keygen-public-key "$CASPER_SECRET_KEY")"
```

If the account is missing or underfunded, use the Casper testnet faucet for the public key produced above.

Deploy the WASM contract:

```bash
casper-client put-deploy \
  --node-address "$CASPER_TESTNET_RPC_URL" \
  --secret-key "$CASPER_SECRET_KEY" \
  --chain-name casper-test \
  --payment-amount 30000000000 \
  --session-path target/wasm32-unknown-unknown/release/grant_escrow.wasm \
  --session-arg "authorized_releaser:account_hash='$CASPER_AUTHORIZED_RELEASER'"
```

Fetch the deploy and save the installed contract hash from the deploy effects:

```bash
casper-client get-deploy \
  --node-address "$CASPER_TESTNET_RPC_URL" \
  DEPLOY_HASH_FROM_PUT_DEPLOY

export CASPER_CONTRACT_HASH="hash-REPLACE_WITH_INSTALLED_CONTRACT_HASH"
```

Export these values into `D:\Hackathons\C-hackathon\apps\api\.env`:

```bash
CASPER_CONTRACT_HASH=hash-REPLACE_WITH_INSTALLED_CONTRACT_HASH
CASPER_AUTHORIZED_RELEASER=account-hash-REPLACE_WITH_EXPRESS_API_WALLET
CASPER_SECRET_KEY=/home/prasad_kapure/.casper/keys/grantflow/secret_key.pem
```

## Backend Integration Notes

The backend file `apps/api/src/casper.ts` should call the deployed contract hash with Casper client tooling or SDK equivalents.

Create a grant:

```ts
await callContract({
  contractHash: process.env.CASPER_CONTRACT_HASH!,
  entryPoint: "create_grant",
  args: {
    grant_id: grantId,
    builder: builderAccountHash,
    amount: amountMotes,
  },
});
```

Deposit funds from the funder wallet:

```ts
await callContract({
  contractHash: process.env.CASPER_CONTRACT_HASH!,
  entryPoint: "deposit_funds",
  args: { grant_id: grantId },
  attachedValue: amountMotes,
});
```

Release payment after AI verification:

```ts
await callContract({
  contractHash: process.env.CASPER_CONTRACT_HASH!,
  entryPoint: "release_payment",
  args: { grant_id: grantId },
  secretKey: process.env.CASPER_SECRET_KEY!,
});
```

`release_payment` must be signed by the `CASPER_AUTHORIZED_RELEASER` wallet configured at initialization.
