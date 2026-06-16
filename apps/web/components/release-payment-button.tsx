"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WalletCards } from "lucide-react";
import { Button } from "@/components/ui";
import { apiFetch, type Transaction } from "@/lib/api";

export function ReleasePaymentButton({
  grantId,
  milestoneId,
  amount,
  builderWallet
}: {
  grantId: string;
  milestoneId: string;
  amount: number;
  builderWallet: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<Transaction | null>(null);

  async function release() {
    setPending(true);
    setError(null);
    try {
      const result = await apiFetch<Transaction>("/payments/release", {
        method: "POST",
        body: JSON.stringify({
          grant_id: grantId,
          milestone_id: milestoneId,
          amount,
          builder_wallet: builderWallet
        })
      });
      setTx(result);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to release payment");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5 grid gap-3">
      <Button onClick={release} disabled={pending || Boolean(tx)} type="button">
        <WalletCards size={16} /> {pending ? "Submitting release" : tx ? "Release submitted" : "Release payment"}
      </Button>
      {tx ? <p className="break-all text-xs text-cyan">{tx.tx_hash}</p> : null}
      {error ? <p className="rounded-md border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
    </div>
  );
}
