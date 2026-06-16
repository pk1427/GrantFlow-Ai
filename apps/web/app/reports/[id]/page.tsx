import type { ReactNode } from "react";
import { CheckCircle2, ShieldAlert, WalletCards } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { demoGrant } from "@/lib/demo-data";

export default function VerificationReportPage() {
  const reasons = [
    "Repository contains 18 commits",
    "README found in default branch",
    "Latest commit is within the last 14 days",
    "Deployment returned HTTP 200",
    "No duplicate repository match detected"
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Badge tone="success">Release executed</Badge>
      <h1 className="mt-3 text-3xl font-bold tracking-normal">AI verification report</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <h2 className="text-xl font-semibold">Verification result</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Score label="Confidence" value={`${demoGrant.milestone.aiScore}%`} icon={<CheckCircle2 />} />
            <Score label="Risk score" value={`${demoGrant.milestone.riskScore}/100`} icon={<ShieldAlert />} />
          </div>
          <ul className="mt-6 space-y-3">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={17} />
                {reason}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <WalletCards className="text-cyan" size={30} />
          <h2 className="mt-4 text-xl font-semibold">Casper release</h2>
          <p className="mt-2 text-sm text-slate-300">Funding agent called `release_payment()` on GrantEscrow.</p>
          <div className="mt-5 rounded-md border border-line bg-ink p-4">
            <p className="text-sm text-slate-400">Transaction hash</p>
            <p className="mt-2 break-all text-sm text-cyan">{demoGrant.releaseTx}</p>
          </div>
          <div className="mt-4 rounded-md border border-line bg-ink p-4">
            <p className="text-sm text-slate-400">Builder reputation</p>
            <p className="mt-2 text-2xl font-semibold">98 +14</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Score({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-ink/60 p-4">
      <div className="mb-3 text-cyan">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
