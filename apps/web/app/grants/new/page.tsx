import { Coins, Plus } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function CreateGrantPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm text-cyan">Create grant</p>
      <h1 className="mt-2 text-3xl font-bold tracking-normal">Lock milestone funding</h1>
      <Card className="mt-6">
        <form className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Grant title</span>
            <input className="rounded-md border border-line bg-ink px-3 py-2" defaultValue="Deploy a working MVP" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Builder wallet</span>
            <input className="rounded-md border border-line bg-ink px-3 py-2" defaultValue="01builder...7aa2" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Reward</span>
              <input className="rounded-md border border-line bg-ink px-3 py-2" defaultValue="100 CSPR" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Network</span>
              <input className="rounded-md border border-line bg-ink px-3 py-2" defaultValue="Casper Testnet" />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Verification rules</span>
            <textarea
              className="min-h-32 rounded-md border border-line bg-ink px-3 py-2"
              defaultValue={"Public GitHub repository exists\nRepository has at least 10 commits\nREADME file exists\nDeployment URL returns HTTP 200\nLatest commit is within the last 14 days"}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="button"><Plus size={16} /> Create grant</Button>
            <Button type="button" className="border border-line bg-transparent text-slate-100 hover:bg-panel">
              <Coins size={16} /> Deposit 100 CSPR
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
