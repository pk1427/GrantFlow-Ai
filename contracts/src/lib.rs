use odra::prelude::*;

#[derive(Clone, PartialEq, Eq, Debug)]
pub enum GrantStatus {
    Created,
    Accepted,
    Funded,
    Released,
    Refunded,
}

#[derive(Clone, Debug)]
pub struct Grant {
    pub id: u64,
    pub creator: Address,
    pub builder: Option<Address>,
    pub total_amount: U512,
    pub status: GrantStatus,
}

#[odra::module]
pub struct GrantFactory {
    grants: Mapping<u64, Grant>,
    next_id: Var<u64>,
}

#[odra::module]
impl GrantFactory {
    pub fn create_grant(&mut self, total_amount: U512) -> u64 {
        let id = self.next_id.get_or_default();
        let grant = Grant {
            id,
            creator: self.env().caller(),
            builder: None,
            total_amount,
            status: GrantStatus::Created,
        };
        self.grants.set(&id, grant);
        self.next_id.set(id + 1);
        id
    }

    pub fn accept_grant(&mut self, id: u64) {
        let mut grant = self.grants.get(&id).expect("grant not found");
        grant.builder = Some(self.env().caller());
        grant.status = GrantStatus::Accepted;
        self.grants.set(&id, grant);
    }

    pub fn get_grant(&self, id: u64) -> Option<Grant> {
        self.grants.get(&id)
    }
}

#[odra::module]
pub struct GrantEscrow {
    balances: Mapping<u64, U512>,
    approvals: Mapping<u64, bool>,
}

#[odra::module]
impl GrantEscrow {
    #[odra(payable)]
    pub fn deposit_funds(&mut self, grant_id: u64) {
        let amount = self.env().attached_value();
        let current = self.balances.get(&grant_id).unwrap_or_default();
        self.balances.set(&grant_id, current + amount);
    }

    pub fn submit_milestone(&mut self, grant_id: u64) {
        self.approvals.set(&grant_id, false);
    }

    pub fn release_payment(&mut self, grant_id: u64, builder: Address) {
        assert!(self.approvals.get(&grant_id).unwrap_or_default(), "milestone not approved");
        let amount = self.balances.get(&grant_id).unwrap_or_default();
        assert!(amount > U512::zero(), "empty escrow");
        self.balances.set(&grant_id, U512::zero());
        self.env().transfer_tokens(&builder, &amount);
    }

    pub fn approve_milestone(&mut self, grant_id: u64) {
        self.approvals.set(&grant_id, true);
    }

    pub fn refund(&mut self, grant_id: u64, funder: Address) {
        let amount = self.balances.get(&grant_id).unwrap_or_default();
        self.balances.set(&grant_id, U512::zero());
        self.env().transfer_tokens(&funder, &amount);
    }
}

#[derive(Clone, Default, Debug)]
pub struct Reputation {
    pub completed: u64,
    pub total_value: U512,
    pub score: u64,
}

#[odra::module]
pub struct ReputationRegistry {
    reputations: Mapping<Address, Reputation>,
}

#[odra::module]
impl ReputationRegistry {
    pub fn record_completion(&mut self, builder: Address, value: U512) {
        let mut reputation = self.reputations.get(&builder).unwrap_or_default();
        reputation.completed += 1;
        reputation.total_value += value;
        reputation.score += 14;
        self.reputations.set(&builder, reputation);
    }

    pub fn get_reputation(&self, builder: Address) -> Reputation {
        self.reputations.get(&builder).unwrap_or_default()
    }
}
