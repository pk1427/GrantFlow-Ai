import {
  Blocks,
  Bot,
  CheckCircle2,
  FileText,
  GitBranch,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  ShieldCheck,
  Workflow
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge, Card, LinkButton, PageShell, SectionHeader } from "@/components/ui";

const primitives = [
  {
    name: "Grant",
    description: "A programmable funding container with creator, token, chain, amount, milestones, and lifecycle state."
  },
  {
    name: "Milestone",
    description: "A payout unit with verification policy, deadline, evidence requirements, and release conditions."
  },
  {
    name: "Evidence",
    description: "A URI-backed proof package such as a GitHub repository, deployment URL, contract address, API endpoint, or document."
  },
  {
    name: "Attestation",
    description: "A structured verifier output containing confidence, risk, evidence hash, model version, and signer identity."
  },
  {
    name: "Reputation",
    description: "A portable builder record derived from completed grants, settlement history, confidence, and risk performance."
  }
];

const layers = [
  {
    icon: Globe2,
    title: "Application Layer",
    text: "Grant portals, hackathon tools, accelerator dashboards, open-source funding apps, and autonomous agent interfaces."
  },
  {
    icon: Blocks,
    title: "Developer Layer",
    text: "SDKs, API endpoints, adapter interfaces, examples, webhooks, and documentation for integrating GrantFlow."
  },
  {
    icon: Network,
    title: "Protocol Layer",
    text: "Core primitives, verification policies, attestation schemas, settlement adapters, and reputation models."
  },
  {
    icon: ShieldCheck,
    title: "Governance Layer",
    text: "Future coordination for evidence types, verifier onboarding, chain support, risk thresholds, and upgrades."
  }
];

const settlementAdapters = [
  {
    chain: "Casper",
    status: "Live reference",
    description: "Odra escrow contract deployed on Casper Testnet with backend SDK calls for grant creation and release."
  },
  {
    chain: "Base",
    status: "Planned",
    description: "EVM adapter for wallet-native UX, Solidity escrow contracts, and broad developer compatibility."
  },
  {
    chain: "Stellar",
    status: "Planned",
    description: "Stablecoin-focused adapter for cross-border funding, NGO disbursements, and fast low-cost settlement."
  }
];

const roadmap = [
  ["Phase 1", "Reference protocol", "Website, whitepaper, docs, Casper reference app, and deployed testnet escrow."],
  ["Phase 2", "Developer platform", "Public SDK, technical specification, explorer, examples, and adapter interfaces."],
  ["Phase 3", "Multi-chain settlement", "Base and Stellar adapters with shared GrantFlow SDK calls."],
  ["Phase 4", "Protocol network", "Verifier marketplace, attestation consensus, portable reputation, and governance portal."]
];

export default function WhitepaperPage() {
  return (
    <PageShell className="max-w-7xl py-10">
      <SectionHeader
        eyebrow="GrantFlow Protocol Whitepaper"
        title="Verifiable work. AI attestation. Automated settlement."
        action={<Badge tone="success">Draft v0.1</Badge>}
      >
        GrantFlow is a chain-agnostic protocol for programmable funding that uses AI-verifiable evidence, portable reputation,
        and multi-chain settlement to automate capital allocation.
      </SectionHeader>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 text-cyan">
            <FileText size={28} />
            <span className="text-sm font-medium">Protocol thesis</span>
          </div>
          <h2 className="mt-5 text-3xl font-semibold leading-tight text-slate-50">Funding should move when outcomes are proven.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Grant programs still rely on manual review, fragmented evidence, slow payment operations, and reputation that stays
            trapped inside individual platforms. GrantFlow turns milestone funding into a verifiable workflow: builders submit
            evidence, AI agents produce structured attestations, and settlement adapters release funds through smart contracts.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Verifiable Work", "AI Attestation", "Automated Settlement"].map((item) => (
              <div key={item} className="rounded-md border border-line bg-ink/60 p-4 text-sm font-medium text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Current implementation</h2>
          <div className="mt-5 space-y-4">
            <Fact label="Reference chain" value="Casper Testnet" />
            <Fact label="Contract" value="GrantEscrow" />
            <Fact label="Verification" value="GitHub + deployment checks" />
            <Fact label="Settlement" value="Backend adapter + Casper SDK" />
          </div>
          <LinkButton href="/dashboard" className="mt-6 w-full">
            Open reference app
          </LinkButton>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {layers.map((layer) => (
          <Card key={layer.title} className="p-5">
            <layer.icon className="text-cyan" size={26} />
            <h2 className="mt-4 text-lg font-semibold">{layer.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{layer.text}</p>
          </Card>
        ))}
      </section>

      <WhitepaperSection
        eyebrow="01"
        title="Problem"
        icon={<LockKeyhole size={24} />}
        text="Capital allocation for grants, bounties, and milestone programs is slowed by manual review and weak verification. Funders must inspect repositories, deployment links, documents, contracts, and progress reports by hand. Builders wait for reviews. Platforms cannot easily share reputation. Smart contracts can hold funds, but they do not understand whether work was completed."
      />

      <WhitepaperSection
        eyebrow="02"
        title="Protocol Design"
        icon={<Layers3 size={24} />}
        text="GrantFlow separates coordination, verification, and settlement. Applications create grants and collect evidence. Verification agents evaluate evidence against explicit policies. The protocol stores structured attestations. Settlement adapters translate verified milestones into chain-specific contract calls. This keeps application code stable while allowing new chains and evidence types to be added over time."
      />

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-3 text-cyan">
          <Workflow size={24} />
          <h2 className="text-2xl font-semibold text-slate-50">Core Primitives</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {primitives.map((item) => (
            <Card key={item.name} className="p-5">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="text-cyan">
            <Bot size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-semibold">AI Verification Architecture</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            The current reference app uses deterministic rules and API checks. The near-term protocol adds LLM reasoning for
            proposal analysis, report generation, and evidence summarization while keeping fund release controlled by structured
            policy outputs and backend settlement logic.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Verification agents</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["GitHub Agent", "Deployment Agent", "Risk Agent", "Contract Agent", "Document Agent", "API Agent"].map((agent) => (
              <div key={agent} className="flex items-center gap-3 rounded-md border border-line bg-ink/60 p-3 text-sm text-slate-300">
                <CheckCircle2 className="text-success" size={17} />
                {agent}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-cyan">
            <KeyRound size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Attestation Model</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            An attestation is the bridge between evidence and settlement. It should include the milestone id, evidence hash,
            confidence score, risk score, verifier identity, model version, reasoning summary, timestamp, and signature. Smart
            contracts should consume only structured attestations or authorized release calls, not raw LLM text.
          </p>
        </Card>
        <Card className="p-6">
          <div className="text-cyan">
            <GitBranch size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Portable Reputation</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Reputation tracks completed grants, delivery consistency, confidence averages, risk history, and total value delivered.
            The long-term goal is a portable builder record that can follow teams across chains, grant portals, hackathons, and
            autonomous funding agents.
          </p>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-3 text-cyan">
          <Globe2 size={24} />
          <h2 className="text-2xl font-semibold text-slate-50">Settlement Adapters</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {settlementAdapters.map((adapter) => (
            <Card key={adapter.chain} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{adapter.chain}</h3>
                <Badge tone={adapter.status === "Live reference" ? "success" : "warn"}>{adapter.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{adapter.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <WhitepaperMini title="Security Assumptions">
          Settlement adapters must verify milestone status, prevent duplicate releases, protect signing keys, and expose clear
          transaction history. LLMs can explain and summarize evidence, but they should never directly sign transactions or bypass
          deterministic release policy.
        </WhitepaperMini>
        <WhitepaperMini title="Governance Direction">
          Early governance should remain lightweight: core team control with community input on evidence types, verification
          policies, and supported chains. Token governance should be postponed until the protocol has real usage and security
          maturity.
        </WhitepaperMini>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-3 text-cyan">
          <ShieldCheck size={24} />
          <h2 className="text-2xl font-semibold text-slate-50">Roadmap</h2>
        </div>
        <Card className="p-0">
          <div className="divide-y divide-line">
            {roadmap.map(([phase, title, text]) => (
              <div key={phase} className="grid gap-3 p-5 md:grid-cols-[140px_220px_1fr] md:items-center">
                <Badge>{phase}</Badge>
                <h3 className="font-semibold text-slate-100">{title}</h3>
                <p className="text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-ink/60 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

function WhitepaperSection({
  eyebrow,
  title,
  icon,
  text
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  text: string;
}) {
  return (
    <Card className="mt-8 p-6 sm:p-8">
      <div className="flex items-center gap-3 text-cyan">
        {icon}
        <span className="text-sm font-medium">{eyebrow}</span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-slate-50">{title}</h2>
      <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-300">{text}</p>
    </Card>
  );
}

function WhitepaperMini({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">{children}</p>
    </Card>
  );
}
