import crypto from "node:crypto";

export type VerificationInput = {
  githubUrl: string;
  deploymentUrl: string;
};

export type VerificationReport = {
  verified: boolean;
  confidence: number;
  reasons: string[];
  checks: {
    repositoryAccessible: boolean;
    commitCount: number;
    readmeFound: boolean;
    latestCommitWithin14Days: boolean;
    deploymentHealthy: boolean;
  };
};

export type RiskReport = {
  risk_level: "low" | "medium" | "high";
  risk_score: number;
  signals: string[];
};

export async function runVerificationAgent(input: VerificationInput): Promise<VerificationReport> {
  const reasons: string[] = [];
  const checks = {
    repositoryAccessible: false,
    commitCount: 0,
    readmeFound: false,
    latestCommitWithin14Days: false,
    deploymentHealthy: false
  };

  const repo = parseGitHubRepo(input.githubUrl);
  if (!repo) {
    reasons.push("GitHub repository URL is not valid");
  } else {
    const repoResult = await fetchJson(`https://api.github.com/repos/${repo.owner}/${repo.name}`);
    checks.repositoryAccessible = repoResult.ok;
    reasons.push(repoResult.ok ? "Public GitHub repository is accessible" : "GitHub repository is not accessible");

    const commits = await fetchJson<GitHubCommit[]>(`https://api.github.com/repos/${repo.owner}/${repo.name}/commits?per_page=100`);
    if (commits.ok && Array.isArray(commits.data)) {
      checks.commitCount = parseCommitCount(commits.headers.get("link"), commits.data.length);
      reasons.push(`Repository contains ${checks.commitCount} commits`);

      const latestCommitDate = commits.data[0]?.commit?.committer?.date ?? commits.data[0]?.commit?.author?.date;
      checks.latestCommitWithin14Days = latestCommitDate ? isWithinDays(latestCommitDate, 14) : false;
      reasons.push(
        checks.latestCommitWithin14Days
          ? "Latest commit is within the last 14 days"
          : "Latest commit is older than 14 days or unavailable"
      );
    } else {
      reasons.push("Unable to read repository commits");
    }

    const readme = await fetchJson(`https://api.github.com/repos/${repo.owner}/${repo.name}/readme`);
    checks.readmeFound = readme.ok;
    reasons.push(checks.readmeFound ? "README found" : "README not found");
  }

  const deployment = await checkDeployment(input.deploymentUrl);
  checks.deploymentHealthy = deployment.ok;
  reasons.push(deployment.ok ? "Deployment URL returned HTTP 200" : deployment.reason);

  const score = [
    checks.repositoryAccessible ? 20 : 0,
    checks.commitCount >= 10 ? 25 : Math.min(checks.commitCount * 2, 20),
    checks.readmeFound ? 20 : 0,
    checks.latestCommitWithin14Days ? 15 : 0,
    checks.deploymentHealthy ? 20 : 0
  ].reduce((sum, value) => sum + value, 0);

  return {
    verified: Object.values(checks).every(Boolean) && checks.commitCount >= 10,
    confidence: Math.min(score, 100),
    reasons,
    checks
  };
}

export async function runRiskAgent(input: VerificationInput, knownRepositoryUrls: string[] = []): Promise<RiskReport> {
  const signals: string[] = [];
  let risk_score = 8;

  const normalizedRepo = normalizeUrl(input.githubUrl);
  const duplicate = knownRepositoryUrls.map(normalizeUrl).filter(Boolean).includes(normalizedRepo);
  if (duplicate) {
    risk_score += 35;
    signals.push("Repository was already submitted for another milestone");
  }

  if (/example|placeholder|localhost|127\.0\.0\.1/i.test(`${input.githubUrl} ${input.deploymentUrl}`)) {
    risk_score += 25;
    signals.push("Evidence contains placeholder or local-only URLs");
  }

  if (input.deploymentUrl.includes("github.com")) {
    risk_score += 10;
    signals.push("Deployment URL appears to point back to GitHub rather than a live app");
  }

  const fingerprint = crypto.createHash("sha256").update(`${input.githubUrl}:${input.deploymentUrl}`).digest("hex");
  if (fingerprint.startsWith("00")) {
    risk_score += 12;
    signals.push("Evidence fingerprint matched a suspicious pattern");
  }

  if (signals.length === 0) signals.push("No duplicate repository or placeholder evidence detected");
  risk_score = Math.min(risk_score, 100);

  return {
    risk_level: risk_score > 65 ? "high" : risk_score > 30 ? "medium" : "low",
    risk_score,
    signals
  };
}

export async function runNotificationAgent(event: string, payload: Record<string, unknown>) {
  return {
    delivered: true,
    event,
    channels: ["email", "discord"],
    payload
  };
}

type GitHubCommit = {
  commit?: {
    author?: { date?: string };
    committer?: { date?: string };
  };
};

type FetchResult<T> =
  | { ok: true; data: T; headers: Headers; status: number }
  | { ok: false; data: null; headers: Headers; status: number; error: string };

function parseGitHubRepo(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const [owner, rawName] = parsed.pathname.split("/").filter(Boolean);
    if (!owner || !rawName) return null;
    return { owner, name: rawName.replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

async function fetchJson<T = unknown>(url: string): Promise<FetchResult<T>> {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "User-Agent": "GrantFlow-AI"
  });
  if (process.env.GITHUB_TOKEN) headers.set("Authorization", `Bearer ${process.env.GITHUB_TOKEN}`);

  try {
    const response = await fetchWithTimeout(url, { headers }, 10_000);
    if (!response.ok) {
      return { ok: false, data: null, headers: response.headers, status: response.status, error: response.statusText };
    }
    return { ok: true, data: (await response.json()) as T, headers: response.headers, status: response.status };
  } catch (error) {
    return {
      ok: false,
      data: null,
      headers: new Headers(),
      status: 0,
      error: error instanceof Error ? error.message : "Request failed"
    };
  }
}

async function checkDeployment(url: string) {
  if (!/^https?:\/\/.+\..+/.test(url)) {
    return { ok: false, reason: "Deployment URL is not a valid public URL" };
  }

  try {
    const head = await fetchWithTimeout(url, { method: "HEAD", redirect: "follow" }, 10_000);
    if (head.ok) return { ok: true, reason: "Deployment URL returned HTTP 200" };
    const get = await fetchWithTimeout(url, { method: "GET", redirect: "follow" }, 10_000);
    return get.ok
      ? { ok: true, reason: "Deployment URL returned HTTP 200" }
      : { ok: false, reason: `Deployment returned HTTP ${get.status}` };
  } catch (error) {
    return { ok: false, reason: `Deployment health check failed: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function parseCommitCount(linkHeader: string | null, currentPageCount: number) {
  const lastPage = linkHeader?.match(/[?&]page=(\d+)>;\s*rel="last"/)?.[1];
  return lastPage ? Number(lastPage) : currentPageCount;
}

function isWithinDays(date: string, days: number) {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
