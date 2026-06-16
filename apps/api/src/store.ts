type GrantRecord = {
  id: string;
  creator_wallet: string;
  builder_wallet?: string;
  total_amount: number;
  status: string;
  milestones: {
    id: string;
    title: string;
    amount: number;
    verification_rules: string[];
    status: string;
  }[];
};

export const grants: GrantRecord[] = [
  {
    id: "grant-001",
    creator_wallet: "01funder...c931",
    builder_wallet: "01builder...7aa2",
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

export const submissions: unknown[] = [];
export const transactions: unknown[] = [];
