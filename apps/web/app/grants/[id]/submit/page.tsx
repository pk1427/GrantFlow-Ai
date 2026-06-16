import { Github, Rocket } from "lucide-react";
import { Button, Card, LinkButton } from "@/components/ui";
import { demoGrant } from "@/lib/demo-data";

export default function SubmitMilestonePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm text-cyan">Builder submission</p>
      <h1 className="mt-2 text-3xl font-bold tracking-normal">Submit milestone evidence</h1>
      <Card className="mt-6">
        <form className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">GitHub repository URL</span>
            <div className="flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2">
              <Github size={18} className="text-cyan" />
              <input className="w-full bg-transparent outline-none" defaultValue={demoGrant.milestone.githubUrl} />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Deployment URL</span>
            <div className="flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2">
              <Rocket size={18} className="text-cyan" />
              <input className="w-full bg-transparent outline-none" defaultValue={demoGrant.milestone.deploymentUrl} />
            </div>
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="button">Run AI verification</Button>
            <LinkButton href="/reports/ms-001" className="border border-line bg-transparent text-slate-100 hover:bg-panel">
              Open generated report
            </LinkButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
