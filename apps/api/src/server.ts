import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { runNotificationAgent, runRiskAgent, runVerificationAgent } from "./agents.js";
import { releasePayment } from "./casper.js";
import { grants, submissions, transactions } from "./store.js";

const app = express();
app.use(cors());
app.use(express.json());

const createGrantSchema = z.object({
  creator_wallet: z.string().min(4),
  builder_wallet: z.string().optional(),
  total_amount: z.number().positive(),
  title: z.string().min(3)
});

const submitSchema = z.object({
  github_url: z.string().url(),
  deployment_url: z.string().url()
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "grantflow-api" }));

app.get("/grants", (_req, res) => res.json(grants));

app.get("/grants/:id", (req, res) => {
  const grant = grants.find((item) => item.id === req.params.id);
  if (!grant) return res.status(404).json({ error: "Grant not found" });
  return res.json(grant);
});

app.post("/grants", (req, res) => {
  const input = createGrantSchema.parse(req.body);
  const grant = {
    id: `grant-${String(grants.length + 1).padStart(3, "0")}`,
    creator_wallet: input.creator_wallet,
    builder_wallet: input.builder_wallet,
    total_amount: input.total_amount,
    status: "FUNDED",
    milestones: [
      {
        id: `ms-${String(grants.length + 1).padStart(3, "0")}`,
        title: input.title,
        amount: input.total_amount,
        verification_rules: ["GitHub repository", "10 commits", "README", "HTTP 200 deployment", "Recent commit"],
        status: "PENDING"
      }
    ]
  };
  grants.push(grant);
  res.status(201).json(grant);
});

app.post("/grants/:id/accept", (req, res) => {
  const grant = grants.find((item) => item.id === req.params.id);
  if (!grant) return res.status(404).json({ error: "Grant not found" });
  grant.status = "ACCEPTED";
  grant.builder_wallet = req.body.builder_wallet ?? grant.builder_wallet;
  res.json(grant);
});

app.post("/milestones/:id/submit", async (req, res) => {
  const input = submitSchema.parse(req.body);
  const grant = grants.find((item) => item.milestones.some((milestone) => milestone.id === req.params.id));
  const milestone = grant?.milestones.find((item) => item.id === req.params.id);
  if (!grant || !milestone) return res.status(404).json({ error: "Milestone not found" });

  milestone.status = "SUBMITTED";
  const verification = await runVerificationAgent({ githubUrl: input.github_url, deploymentUrl: input.deployment_url });
  const risk = await runRiskAgent({ githubUrl: input.github_url, deploymentUrl: input.deployment_url });
  milestone.status = verification.verified && risk.risk_level !== "high" ? "VERIFIED" : "REJECTED";

  const submission = {
    id: `sub-${submissions.length + 1}`,
    milestone_id: milestone.id,
    github_url: input.github_url,
    deployment_url: input.deployment_url,
    ai_score: verification.confidence,
    risk_score: risk.risk_score,
    verification,
    risk
  };
  submissions.push(submission);
  await runNotificationAgent("verification.completed", submission);
  res.status(201).json(submission);
});

app.post("/agents/verify", async (req, res) => {
  const input = submitSchema.parse(req.body);
  const verification = await runVerificationAgent({ githubUrl: input.github_url, deploymentUrl: input.deployment_url });
  const risk = await runRiskAgent({ githubUrl: input.github_url, deploymentUrl: input.deployment_url });
  res.json({ verification, risk });
});

app.post("/payments/release", async (req, res) => {
  const schema = z.object({
    grant_id: z.string(),
    milestone_id: z.string(),
    amount: z.number().positive(),
    builder_wallet: z.string().min(4)
  });
  const input = schema.parse(req.body);
  const release = await releasePayment({
    grantId: input.grant_id,
    milestoneId: input.milestone_id,
    amount: input.amount,
    builderWallet: input.builder_wallet
  });
  const transaction = {
    id: `tx-${transactions.length + 1}`,
    grant_id: input.grant_id,
    tx_hash: release.txHash,
    amount: input.amount,
    release
  };
  transactions.push(transaction);
  await runNotificationAgent("funds.released", transaction);
  res.status(201).json(transaction);
});

app.get("/transactions", (_req, res) => res.json(transactions));

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`GrantFlow API listening on http://localhost:${port}`);
});
