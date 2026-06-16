export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Milestone = {
  id: string;
  title: string;
  amount: number;
  verification_rules: string[];
  status: string;
};

export type Grant = {
  id: string;
  creator_wallet: string;
  builder_wallet?: string;
  total_amount: number;
  status: string;
  onchain?: {
    txHash?: string;
    mode?: string;
    entryPoint?: string;
  } | null;
  milestones: Milestone[];
};

export type Submission = {
  id: string;
  milestone_id: string;
  grant_id: string;
  github_url: string;
  deployment_url: string;
  ai_score: number;
  risk_score: number;
  verification?: {
    verified: boolean;
    confidence: number;
    reasons: string[];
  };
  risk?: {
    risk_level: string;
    risk_score: number;
    signals: string[];
  };
};

export type Transaction = {
  id: string;
  grant_id: string;
  milestone_id?: string;
  label: string;
  tx_hash: string;
  amount: number;
  status: string;
  release?: {
    mode?: string;
    entryPoint?: string;
    contractHash?: string;
  };
};

export type IndexerState = {
  source: string;
  network: string;
  contractHash?: string;
  grants: Grant[];
  submissions: Submission[];
  transactions: Transaction[];
  stats: {
    total_grants: number;
    funds_locked: number;
    funds_released: number;
    ai_score: number;
    reputation_score: number;
  };
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function shortHash(value?: string) {
  if (!value) return "Not available";
  if (value.length <= 18) return value;
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}

export function explorerDeployUrl(hash?: string) {
  return hash ? `https://testnet.cspr.live/deploy/${hash}` : undefined;
}
