export type MilestoneRecord = {
  id: string;
  title: string;
  amount: number;
  verification_rules: string[];
  status: string;
};

export type GrantRecord = {
  id: string;
  creator_wallet: string;
  builder_wallet?: string;
  total_amount: number;
  status: string;
  onchain?: unknown;
  milestones: MilestoneRecord[];
};

export const grants: GrantRecord[] = [
  {
    id: "grant-001",
    creator_wallet: "casper-wallet-not-connected",
    builder_wallet: "account-hash-1130715646e6847e65732ba746ecad6fce0f33ba4ac6c9f4f021674cea2ab3a5",
    total_amount: 100,
    status: "FUNDED",
    milestones: [
      {
        id: "ms-001",
        title: "Deploy a working MVP",
        amount: 100,
        verification_rules: [
          "Public GitHub repository exists",
          "Repository has at least 10 commits",
          "README file exists",
          "Deployment URL returns HTTP 200",
          "Latest commit is within the last 14 days"
        ],
        status: "PENDING"
      }
    ]
  }
];

export type SubmissionRecord = {
  id: string;
  milestone_id: string;
  grant_id: string;
  github_url: string;
  deployment_url: string;
  ai_score: number;
  risk_score: number;
  verification: unknown;
  risk: unknown;
};

export type TransactionRecord = {
  id: string;
  grant_id: string;
  milestone_id?: string;
  label: string;
  tx_hash: string;
  amount: number;
  status: string;
  release?: unknown;
};

export const submissions: SubmissionRecord[] = [];
export const transactions: TransactionRecord[] = [];
