import { Bot, CheckCircle2, ExternalLink } from "lucide-react";
import { Badge, Card, LinkButton } from "@/components/ui";
import { demoGrant } from "@/lib/demo-data";

export default function GrantDetailsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge tone="success">{demoGrant.status}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-normal">{demoGrant.title}</h1>
          <p className="mt-2 text-slate-300">Funder {demoGrant.funder} · Builder {demoGrant.builder}</p>
        </div>
        <LinkButton href="/grants/grant-001/submit">Submit evidence</LinkButton>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-semibold">Milestone criteria</h2>
          <ul className="mt-4 space-y-3">
            {demoGrant.milestone.criteria.map((rule) => (
              <li key={rule} className="flex gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={17} />
                {rule}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Bot className="text-cyan" size={30} />
          <h2 className="mt-4 text-xl font-semibold">AI verification</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Confidence {demoGrant.milestone.aiScore}%, risk level {demoGrant.milestone.riskLevel}, release authorized.
          </p>
          <LinkButton href="/reports/ms-001" className="mt-5">
            View report <ExternalLink size={16} />
          </LinkButton>
        </Card>
      </div>
    </div>
  );
}
