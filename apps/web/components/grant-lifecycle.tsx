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
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {steps.map((step) => {
          const done = active[step.key as keyof typeof active];
          const Icon = step.icon;
          return (
            <div key={step.key} className="rounded-md border border-line bg-ink/50 p-4">
              <div className={done ? "text-success" : "text-slate-500"}>
                {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <Icon className="mt-4 text-cyan" size={18} />
              <p className="mt-3 text-sm font-medium">{step.label}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
