import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import CasperSdk from "casper-js-sdk";
import type { CLValue as CasperCLValue, Hash as CasperHash } from "casper-js-sdk";

const {
  Args,
  CLValue,
  ContractHash,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  HttpHandler,
  Key,
  KeyAlgorithm,
  PrivateKey,
  RpcClient,
  StoredContractByHash
} = CasperSdk;

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

export function getCasperRuntimeConfig() {
  return {
    network: "casper-test",
    onchainEnabled: isOnchainEnabled(),
    contractHash: process.env.CASPER_CONTRACT_HASH,
    contractPackageHash: process.env.CASPER_CONTRACT_PACKAGE_HASH,
    authorizedReleaser: process.env.CASPER_AUTHORIZED_RELEASER,
    callMode: getCasperCallMode(),
    clientPath: process.env.CASPER_CLIENT_PATH ?? "casper-client"
  };
}

export async function createGrant(input: CreateGrantInput) {
  const configured = isOnchainEnabled();
  const grantId = toContractGrantId(input.grantId);
  const amountMotes = csprToMotes(input.amount);

  if (configured) {
    if (!input.builderWallet.startsWith("account-hash-")) {
      throw new Error("builderWallet must be an account-hash-* value for Casper create_grant calls");
    }

    const deploy = await callGrantEscrow("create_grant", [
      casperArg("grant_id", `grant_id:u64='${grantId}'`, CLValue.newCLUint64(grantId)),
      casperArg("builder", `builder:key='${input.builderWallet}'`, newAccountHashKey(input.builderWallet)),
      casperArg("amount", `amount:u512='${amountMotes}'`, CLValue.newCLUInt512(amountMotes))
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
  const configured = isOnchainEnabled();
  const grantId = toContractGrantId(input.grantId);

  if (configured) {
    const release = await callGrantEscrow("release_payment", [
      casperArg("grant_id", `grant_id:u64='${grantId}'`, CLValue.newCLUint64(grantId))
    ]);

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

function getCasperSecretKeyPath() {
  if (process.env.CASPER_SECRET_KEY) {
    return process.env.CASPER_SECRET_KEY;
  }

  const encodedPem = process.env.CASPER_SECRET_KEY_PEM_BASE64;
  const rawPem = process.env.CASPER_SECRET_KEY_PEM;
  if (!encodedPem && !rawPem) {
    return undefined;
  }

  const pem = encodedPem ? Buffer.from(encodedPem, "base64").toString("utf8") : rawPem!.replace(/\\n/g, "\n");
  const keyPath = path.join(os.tmpdir(), "grantflow-casper-secret-key.pem");

  if (!fs.existsSync(keyPath) || fs.readFileSync(keyPath, "utf8") !== pem) {
    fs.writeFileSync(keyPath, pem, { mode: 0o600 });
    fs.chmodSync(keyPath, 0o600);
  }

  return keyPath;
}

function getCasperSecretKeyPem() {
  const encodedPem = process.env.CASPER_SECRET_KEY_PEM_BASE64;
  const rawPem = process.env.CASPER_SECRET_KEY_PEM;

  if (encodedPem) {
    return Buffer.from(encodedPem, "base64").toString("utf8");
  }

  if (rawPem) {
    return rawPem.replace(/\\n/g, "\n");
  }

  const keyPath = process.env.CASPER_SECRET_KEY;
  if (keyPath && fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, "utf8");
  }

  return undefined;
}

function isOnchainEnabled() {
  return (
    process.env.CASPER_ONCHAIN_ENABLED === "true" &&
    Boolean(process.env.CASPER_CONTRACT_HASH && getCasperSecretKeyPem())
  );
}

type CasperArg = {
  name: string;
  cli: string;
  sdk: CasperCLValue;
};

function casperArg(name: string, cli: string, sdk: CasperCLValue): CasperArg {
  return { name, cli, sdk };
}

async function callGrantEscrow(entryPoint: string, sessionArgs: CasperArg[]) {
  if (getCasperCallMode() === "client") {
    return callGrantEscrowWithClient(entryPoint, sessionArgs);
  }

  return callGrantEscrowWithSdk(entryPoint, sessionArgs);
}

async function callGrantEscrowWithSdk(entryPoint: string, sessionArgs: CasperArg[]) {
  const contractHash = process.env.CASPER_CONTRACT_HASH;
  const secretKeyPem = getCasperSecretKeyPem();
  const nodeAddress = process.env.CASPER_TESTNET_RPC_URL ?? "https://node.testnet.casper.network/rpc";

  if (!contractHash || !secretKeyPem) {
    throw new Error("CASPER_CONTRACT_HASH and CASPER_SECRET_KEY_PEM_BASE64 are required for Casper SDK calls");
  }

  const privateKey = PrivateKey.fromPem(secretKeyPem, getCasperKeyAlgorithm());
  const args = Args.fromMap(Object.fromEntries(sessionArgs.map((arg) => [arg.name, arg.sdk])));
  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(stripHashPrefix(contractHash)),
    entryPoint,
    args
  );

  const payment = ExecutableDeployItem.standardPayment(process.env.CASPER_PAYMENT_AMOUNT ?? "30000000000");
  const deployHeader = DeployHeader.default();
  deployHeader.account = privateKey.publicKey;
  deployHeader.chainName = "casper-test";

  const deploy = Deploy.makeDeploy(deployHeader, payment, session);
  deploy.sign(privateKey);

  try {
    const rpcClient = new RpcClient(new HttpHandler(nodeAddress));
    const result = await rpcClient.putDeploy(deploy);
    return { deployHash: normalizeDeployHash(result.deployHash), output: JSON.stringify(result) };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Casper SDK deploy failed");
    }
    throw error;
  }
}

async function callGrantEscrowWithClient(entryPoint: string, sessionArgs: CasperArg[]) {
  const contractHash = process.env.CASPER_CONTRACT_HASH;
  const secretKey = getCasperSecretKeyPath();
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
    ...sessionArgs.flatMap((arg) => ["--session-arg", arg.cli])
  ];

  let stdout = "";
  let stderr = "";

  try {
    const result = await execFileAsync(clientPath, args, { windowsHide: true });
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (error) {
    if (isMissingExecutableError(error)) {
      throw new Error(
        `Casper on-chain mode is enabled, but "${clientPath}" is not available in this shell. Install casper-client or set CASPER_ONCHAIN_ENABLED=false for local demo mode.`
      );
    }
    if (isExecFailure(error)) {
      const message = [error.stderr, error.stdout, error.message].filter(Boolean).join("\n").trim();
      throw new Error(message || "casper-client command failed");
    }
    throw error;
  }

  const output = `${stdout}\n${stderr}`;
  const deployHash = parseDeployHash(output);

  return { deployHash, output };
}

function newAccountHashKey(accountHash: string) {
  return CLValue.newCLKey(Key.createByType(stripAccountHashPrefix(accountHash), 0));
}

function getCasperCallMode() {
  return process.env.CASPER_CALL_MODE === "client" ? "client" : "sdk";
}

function getCasperKeyAlgorithm() {
  return process.env.CASPER_KEY_ALGORITHM === "secp256k1" ? KeyAlgorithm.SECP256K1 : KeyAlgorithm.ED25519;
}

function isMissingExecutableError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

function isExecFailure(error: unknown): error is { stdout?: string; stderr?: string; message?: string } {
  return Boolean(error && typeof error === "object" && ("stdout" in error || "stderr" in error));
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

function normalizeDeployHash(deployHash: string | CasperHash) {
  return typeof deployHash === "string" ? deployHash : deployHash.toHex();
}
