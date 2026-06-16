import type { ReactNode } from "react";
import { Activity, ArrowUpRight, Gauge, Trophy } from "lucide-react";
import { Badge, Card, LinkButton } from "@/components/ui";
import { demoGrant, stats, transactions } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-cyan">Funder dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal">Milestone funding console</h1>
        </div>
        <LinkButton href="/grants/new">New grant</LinkButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone="success">{demoGrant.status}</Badge>
              <h2 className="mt-4 text-2xl font-semibold">{demoGrant.title}</h2>
              <p className="mt-2 text-sm text-slate-300">Escrowed milestone reward: {demoGrant.amount} CSPR</p>
            </div>
            <Gauge className="text-cyan" size={32} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric icon={<Activity size={18} />} label="AI confidence" value={`${demoGrant.milestone.aiScore}%`} />
            <Metric icon={<Trophy size={18} />} label="Risk score" value={`${demoGrant.milestone.riskScore}/100`} />
            <Metric icon={<ArrowUpRight size={18} />} label="Reputation" value="+14 pts" />
          </div>
          <LinkButton href="/grants/grant-001" className="mt-6">Open grant</LinkButton>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Transaction history</h2>
          <div className="mt-4 space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{tx.label}</p>
                  <Badge tone="success">{tx.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">{tx.amount} CSPR</p>
                <p className="mt-1 break-all text-xs text-cyan">{tx.hash}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-ink/50 p-4">
      <div className="mb-3 text-cyan">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
