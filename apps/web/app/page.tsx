import { ArrowRight, Bot, Coins, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr]">
      <section>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan">Casper testnet escrow</p>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-normal sm:text-6xl">
          GrantFlow AI
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Milestone grants that verify evidence, release funds, and update builder reputation without waiting on manual review.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/dashboard">
            Launch demo <ArrowRight size={17} />
          </LinkButton>
          <LinkButton href="/grants/new" className="border border-line bg-transparent text-slate-100 hover:bg-panel">
            Create grant
          </LinkButton>
        </div>
      </section>
      <section className="grid gap-4">
        {[
          { icon: Coins, title: "Escrowed funding", text: "Funder locks 100 CSPR for a milestone contract." },
          { icon: Bot, title: "Agent verification", text: "Agents inspect GitHub, deployment health, recency, and risk." },
          { icon: ShieldCheck, title: "Autonomous release", text: "Funding agent records a Casper transaction and reputation event." }
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-line bg-panel/85 p-5">
            <item.icon className="mb-4 text-cyan" size={28} />
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
