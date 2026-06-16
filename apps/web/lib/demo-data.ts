export const demoGrant = {
  id: "grant-001",
  title: "Deploy a working MVP",
  funder: "01funder...c931",
  builder: "01builder...7aa2",
  amount: 100,
  status: "Funds released",
  escrowTx: "0xescrow5a8f2c9e",
  releaseTx: "0xrelease91be330a",
  milestone: {
    id: "ms-001",
    title: "Deploy a working MVP",
    criteria: [
      "Public GitHub repository exists",
      "Repository has at least 10 commits",
      "README file exists",
      "Deployment URL returns HTTP 200",
      "Latest commit is within the last 14 days"
    ],
    githubUrl: "https://github.com/example/grantflow-mvp",
    deploymentUrl: "https://grantflow-demo.vercel.app",
    aiScore: 92,
    riskScore: 12,
    riskLevel: "low"
  }
};

export const transactions = [
  { id: "tx-1", label: "Escrow deposit", amount: 100, hash: demoGrant.escrowTx, status: "Finalized" },
  { id: "tx-2", label: "Milestone release", amount: 100, hash: demoGrant.releaseTx, status: "Finalized" }
];

export const stats = [
  { label: "Total grants", value: "12" },
  { label: "Funds locked", value: "420 CSPR" },
  { label: "Funds released", value: "1,840 CSPR" },
  { label: "AI score", value: "92%" },
  { label: "Reputation", value: "98" }
];
