import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { runNotificationAgent, runRiskAgent, runVerificationAgent } from "./agents.js";
import { createGrant, getCasperRuntimeConfig, releasePayment } from "./casper.js";
import { grants, submissions, transactions, type GrantRecord } from "./store.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

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

const asyncRoute =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };

app.get("/health", (_req, res) => res.json({ ok: true, service: "grantflow-api" }));

app.get("/config", (_req, res) => {
  res.json({
    casper: getCasperRuntimeConfig(),
    indexer: {
      source: "backend-indexer",
      frontendReadsBlockchain: false
    }
  });
});

app.get("/grants", (_req, res) => res.json(grants));

app.get("/indexer/state", (_req, res) => {
  const fundsLocked = grants
    .filter((grant) => grant.status === "FUNDED" || grant.status === "ACCEPTED")
    .reduce((sum, grant) => sum + grant.total_amount, 0);
  const fundsReleased = transactions
    .filter((tx) => tx.label === "Milestone release")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const latestSubmission = submissions.at(-1);

  res.json({
    source: "backend-indexer",
    network: "casper-test",
    contractHash: process.env.CASPER_CONTRACT_HASH,
    grants,
    submissions,
    transactions,
    stats: {
      total_grants: grants.length,
      funds_locked: fundsLocked,
      funds_released: fundsReleased,
      ai_score: latestSubmission?.ai_score ?? 0,
      reputation_score: 84 + transactions.filter((tx) => tx.label === "Milestone release").length * 14
    }
  });
});

app.get("/grants/:id", (req, res) => {
  const grant = grants.find((item) => item.id === req.params.id);
  if (!grant) return res.status(404).json({ error: "Grant not found" });
  return res.json(grant);
});

app.post("/grants", asyncRoute(async (req, res) => {
  const input = createGrantSchema.parse(req.body);
  const grantId = `grant-${String(grants.length + 1).padStart(3, "0")}`;
  const milestoneId = `ms-${String(grants.length + 1).padStart(3, "0")}`;
  const grant: GrantRecord = {
    id: grantId,
    creator_wallet: input.creator_wallet,
    builder_wallet: input.builder_wallet,
    total_amount: input.total_amount,
    status: "FUNDED",
    milestones: [
      {
        id: milestoneId,
        title: input.title,
        amount: input.total_amount,
        verification_rules: ["GitHub repository", "10 commits", "README", "HTTP 200 deployment", "Recent commit"],
        status: "PENDING"
      }
    ]
  };

  const onchain = input.builder_wallet
    ? await createGrant({
        grantId,
        builderWallet: input.builder_wallet,
        amount: input.total_amount
      })
    : null;

  grant.onchain = onchain;
  grants.push(grant);
  if (onchain) {
    transactions.push({
      id: `tx-${transactions.length + 1}`,
      grant_id: grant.id,
      milestone_id: milestoneId,
      label: "Grant created",
      tx_hash: onchain.txHash,
      amount: input.total_amount,
      status: onchain.finalized ? "Finalized" : "Submitted",
      release: onchain
    });
  }
  res.status(201).json({ ...grant, onchain });
}));

app.post("/grants/:id/accept", (req, res) => {
  const grant = grants.find((item) => item.id === req.params.id);
  if (!grant) return res.status(404).json({ error: "Grant not found" });
  grant.status = "ACCEPTED";
  grant.builder_wallet = req.body.builder_wallet ?? grant.builder_wallet;
  res.json(grant);
});

app.post("/milestones/:id/submit", asyncRoute(async (req, res) => {
  const input = submitSchema.parse(req.body);
  const grant = grants.find((item) => item.milestones.some((milestone) => milestone.id === req.params.id));
  const milestone = grant?.milestones.find((item) => item.id === req.params.id);
  if (!grant || !milestone) return res.status(404).json({ error: "Milestone not found" });
  if (milestone.status === "PAID") {
    return res.status(409).json({ error: "Milestone is already paid and cannot be resubmitted" });
  }

  milestone.status = "SUBMITTED";
  const verification = await runVerificationAgent({ githubUrl: input.github_url, deploymentUrl: input.deployment_url });
  const risk = await runRiskAgent(
    { githubUrl: input.github_url, deploymentUrl: input.deployment_url },
    submissions.map((submission) => submission.github_url)
  );
  milestone.status = verification.verified && risk.risk_level !== "high" ? "VERIFIED" : "REJECTED";

  const submission = {
    id: `sub-${submissions.length + 1}`,
    milestone_id: milestone.id,
    grant_id: grant.id,
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
}));

app.post("/agents/verify", asyncRoute(async (req, res) => {
  const input = submitSchema.parse(req.body);
  const verification = await runVerificationAgent({ githubUrl: input.github_url, deploymentUrl: input.deployment_url });
  const risk = await runRiskAgent(
    { githubUrl: input.github_url, deploymentUrl: input.deployment_url },
    submissions.map((submission) => submission.github_url)
  );
  res.json({ verification, risk });
}));

app.post("/payments/release", asyncRoute(async (req, res) => {
  const schema = z.object({
    grant_id: z.string(),
    milestone_id: z.string(),
    amount: z.number().positive(),
    builder_wallet: z.string().min(4)
  });
  const input = schema.parse(req.body);
  const grant = grants.find((item) => item.id === input.grant_id);
  const milestone = grant?.milestones.find((item) => item.id === input.milestone_id);
  if (!grant || !milestone) return res.status(404).json({ error: "Grant or milestone not found" });

  const existingRelease = transactions.find(
    (tx) => tx.grant_id === input.grant_id && tx.milestone_id === input.milestone_id && tx.label === "Milestone release"
  );
  if (existingRelease) return res.status(200).json(existingRelease);

  if (milestone.status !== "VERIFIED") {
    return res.status(409).json({ error: `Milestone must be VERIFIED before release. Current status: ${milestone.status}` });
  }

  const release = await releasePayment({
    grantId: input.grant_id,
    milestoneId: input.milestone_id,
    amount: input.amount,
    builderWallet: input.builder_wallet
  });
  const transaction = {
    id: `tx-${transactions.length + 1}`,
    grant_id: input.grant_id,
    milestone_id: input.milestone_id,
    label: "Milestone release",
    tx_hash: release.txHash,
    amount: input.amount,
    status: release.finalized ? "Finalized" : "Submitted",
    release
  };
  transactions.push(transaction);
  grant.status = "RELEASED";
  milestone.status = "PAID";
  await runNotificationAgent("funds.released", transaction);
  res.status(201).json(transaction);
}));

app.get("/transactions", (_req, res) => res.json(transactions));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: "Invalid request", details: error.flatten() });
  }

  const message = error instanceof Error ? error.message : "Unexpected API error";
  return res.status(500).json({ error: message });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`GrantFlow API listening on http://localhost:${port}`);
});
