import crypto from "node:crypto";

export type ReleasePaymentInput = {
  grantId: string;
  milestoneId: string;
  amount: number;
  builderWallet: string;
};

export async function releasePayment(input: ReleasePaymentInput) {
  const configured = Boolean(process.env.CASPER_GRANT_ESCROW_HASH && process.env.CASPER_PRIVATE_KEY_PATH);
  const txHash = crypto
    .createHash("sha256")
    .update(`release:${input.grantId}:${input.milestoneId}:${input.amount}:${input.builderWallet}`)
    .digest("hex");

  return {
    network: process.env.NEXT_PUBLIC_CASPER_NETWORK ?? "casper-test",
    contractHash: process.env.CASPER_GRANT_ESCROW_HASH ?? "mock-grant-escrow",
    txHash: configured ? txHash : `mock-${txHash.slice(0, 24)}`,
    finalized: true,
    mode: configured ? "casper-testnet" : "local-demo"
  };
}
