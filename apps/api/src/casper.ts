import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type ReleasePaymentInput = {
  grantId: string;
  milestoneId: string;
  amount: number;
  builderWallet: string;
};

export type CreateGrantInput = {
  grantId: string;
  builderWallet: string;
  amount: number;
};

export async function createGrant(input: CreateGrantInput) {
  const configured = Boolean(process.env.CASPER_CONTRACT_HASH && process.env.CASPER_SECRET_KEY);
  const grantId = toContractGrantId(input.grantId);
  const amountMotes = csprToMotes(input.amount);

  if (configured) {
    if (!input.builderWallet.startsWith("account-hash-")) {
      throw new Error("builderWallet must be an account-hash-* value for Casper create_grant calls");
    }

    const deploy = await callGrantEscrow("create_grant", [
      `grant_id:u64='${grantId}'`,
      `builder:account_hash='${stripAccountHashPrefix(input.builderWallet)}'`,
      `amount:U512='${amountMotes}'`
    ]);

    return {
      network: "casper-test",
      contractHash: process.env.CASPER_CONTRACT_HASH,
      txHash: deploy.deployHash,
      finalized: false,
      mode: "casper-testnet",
      entryPoint: "create_grant"
    };
  }

  return {
    network: "casper-test",
    contractHash: process.env.CASPER_CONTRACT_HASH ?? "mock-grant-escrow",
    txHash: deterministicMockHash({
      grantId: input.grantId,
      milestoneId: "create",
      amount: input.amount,
      builderWallet: input.builderWallet
    }),
    finalized: true,
    mode: "local-demo",
    entryPoint: "create_grant"
  };
}

export async function releasePayment(input: ReleasePaymentInput) {
  const configured = Boolean(process.env.CASPER_CONTRACT_HASH && process.env.CASPER_SECRET_KEY);
  const grantId = toContractGrantId(input.grantId);

  if (configured) {
    const release = await callGrantEscrow("release_payment", [`grant_id:u64='${grantId}'`]);

    return {
      network: "casper-test",
      contractHash: process.env.CASPER_CONTRACT_HASH,
      txHash: release.deployHash,
      finalized: false,
      mode: "casper-testnet",
      entryPoint: "release_payment"
    };
  }

  return {
    network: "casper-test",
    contractHash: process.env.CASPER_CONTRACT_HASH ?? "mock-grant-escrow",
    txHash: deterministicMockHash(input),
    finalized: true,
    mode: "local-demo",
    entryPoint: "release_payment"
  };
}

function toContractGrantId(grantId: string) {
  const numeric = grantId.match(/\d+/)?.[0];
  if (!numeric) {
    throw new Error(`Grant id "${grantId}" does not contain a numeric contract id`);
  }
  return Number(numeric);
}

function deterministicMockHash(input: ReleasePaymentInput) {
  const txHash = crypto
    .createHash("sha256")
    .update(`release:${input.grantId}:${input.milestoneId}:${input.amount}:${input.builderWallet}`)
    .digest("hex");

  return `mock-${txHash.slice(0, 24)}`;
}

function csprToMotes(amount: number) {
  return BigInt(Math.round(amount * 1_000_000_000)).toString();
}

async function callGrantEscrow(entryPoint: string, sessionArgs: string[]) {
  const contractHash = process.env.CASPER_CONTRACT_HASH;
  const secretKey = process.env.CASPER_SECRET_KEY;
  const nodeAddress = process.env.CASPER_TESTNET_RPC_URL ?? "https://node.testnet.casper.network/rpc";
  const clientPath = process.env.CASPER_CLIENT_PATH ?? "casper-client";

  if (!contractHash || !secretKey) {
    throw new Error("CASPER_CONTRACT_HASH and CASPER_SECRET_KEY are required for Casper calls");
  }

  const args = [
    "put-deploy",
    "--node-address",
    nodeAddress,
    "--secret-key",
    secretKey,
    "--chain-name",
    "casper-test",
    "--payment-amount",
    process.env.CASPER_PAYMENT_AMOUNT ?? "3000000000",
    "--session-hash",
    stripHashPrefix(contractHash),
    "--session-entry-point",
    entryPoint,
    ...sessionArgs.flatMap((arg) => ["--session-arg", arg])
  ];

  const { stdout, stderr } = await execFileAsync(clientPath, args, { windowsHide: true });
  const output = `${stdout}\n${stderr}`;
  const deployHash = parseDeployHash(output);

  return { deployHash, output };
}

function stripHashPrefix(hash: string) {
  return hash.replace(/^hash-/, "");
}

function stripAccountHashPrefix(accountHash: string) {
  return accountHash.replace(/^account-hash-/, "");
}

function parseDeployHash(output: string) {
  const match = output.match(/[a-f0-9]{64}/i);
  if (!match) {
    throw new Error(`Unable to parse Casper deploy hash from casper-client output: ${output}`);
  }
  return match[0];
}
