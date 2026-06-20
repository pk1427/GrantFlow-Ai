import { CheckCircle2, Circle, Coins, FileCheck2, Rocket, ShieldCheck } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { formatStatus, type Grant, type Submission, type Transaction } from "@/lib/api";

const steps = [
  { key: "created", label: "Grant created", icon: Coins },
  { key: "submitted", label: "Evidence submitted", icon: FileCheck2 },
  { key: "verified", label: "AI verified", icon: ShieldCheck },
  { key: "released", label: "Funds released", icon: Rocket }
];

export function GrantLifecycle({
  grant,
  submission,
  release
}: {
  grant?: Grant;
  submission?: Submission;
  release?: Transaction;
}) {
  const milestone = grant?.milestones[0];
  const active = {
    created: Boolean(grant),
    submitted: Boolean(submission),
    verified: milestone?.status === "VERIFIED" || milestone?.status === "PAID",
    released: Boolean(release) || milestone?.status === "PAID"
  };

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lifecycle</h2>
          <p className="mt-1 text-sm text-slate-400">Backend-indexed grant state</p>
        </div>
        <Badge tone={active.released ? "success" : active.verified ? "default" : "warn"}>
          {formatStatus(milestone?.status ?? grant?.status)}
        </Badge>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {steps.map((step) => {
          const done = active[step.key as keyof typeof active];
          const Icon = step.icon;
          return (
            <div key={step.key} className="relative flex gap-4 rounded-md border border-line bg-ink/50 p-4 md:block">
              <div className={done ? "text-success" : "text-slate-500"}>
                {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </div>
              <div>
                <Icon className="text-cyan md:mt-4" size={18} />
                <p className="mt-2 text-sm font-medium md:mt-3">{step.label}</p>
                <p className="mt-1 text-xs text-slate-500">{done ? "Complete" : "Pending"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
