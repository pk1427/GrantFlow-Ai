#![cfg_attr(target_arch = "wasm32", no_std)]

pub mod errors;
pub mod events;

use errors::{GrantEscrowError, RevertExt};
use events::{FundsDeposited, GrantCreated, PaymentReleased};
use odra::casper_types::U512;
use odra::prelude::*;

#[odra::odra_type]
pub struct Grant {
    pub grant_id: u64,
    pub funder: Address,
    pub builder: Address,
    pub amount: U512,
    pub funded: bool,
    pub released: bool,
    pub authorized_releaser: Address,
}

#[odra::module]
pub struct GrantEscrow {
    grants: Mapping<u64, Grant>,
    authorized_releaser: Var<Address>,
}

#[odra::module]
impl GrantEscrow {
    pub fn init(&mut self, authorized_releaser: Address) {
        self.authorized_releaser.set(authorized_releaser);
    }

    pub fn create_grant(&mut self, grant_id: u64, builder: Address, amount: U512) {
        if self.grants.get(&grant_id).is_some() {
            self.revert_with(GrantEscrowError::GrantAlreadyExists);
        }

        if amount.is_zero() {
            self.revert_with(GrantEscrowError::InvalidAmount);
        }

        let funder = self.env().caller();
        let authorized_releaser = self.authorized_releaser.get().unwrap_or_revert(self);
        let grant = Grant {
            grant_id,
            funder,
            builder,
            amount,
            funded: false,
            released: false,
            authorized_releaser,
        };

        self.grants.set(&grant_id, grant.clone());
        self.env().emit_event(GrantCreated {
            grant_id,
            funder,
            builder,
            amount,
        });
    }

    #[odra(payable)]
    pub fn deposit_funds(&mut self, grant_id: u64) {
        let mut grant = self.grant_or_revert(grant_id);
        let caller = self.env().caller();

        if caller != grant.funder {
            self.revert_with(GrantEscrowError::Unauthorized);
        }

        if grant.funded {
            self.revert_with(GrantEscrowError::AlreadyFunded);
        }

        if self.env().attached_value() != grant.amount {
            self.revert_with(GrantEscrowError::InvalidAmount);
        }

        grant.funded = true;
        self.grants.set(&grant_id, grant.clone());
        self.env().emit_event(FundsDeposited {
            grant_id,
            funder: grant.funder,
            builder: grant.builder,
            amount: grant.amount,
        });
    }

    pub fn release_payment(&mut self, grant_id: u64) {
        let mut grant = self.grant_or_revert(grant_id);
        let caller = self.env().caller();

        if caller != grant.authorized_releaser {
            self.revert_with(GrantEscrowError::Unauthorized);
        }

        if !grant.funded {
            self.revert_with(GrantEscrowError::NotFunded);
        }

        if grant.released {
            self.revert_with(GrantEscrowError::AlreadyReleased);
        }

        grant.released = true;
        self.grants.set(&grant_id, grant.clone());
        self.env().transfer_tokens(&grant.builder, &grant.amount);
        self.env().emit_event(PaymentReleased {
            grant_id,
            releaser: caller,
            builder: grant.builder,
            amount: grant.amount,
        });
    }

    pub fn get_grant(&self, grant_id: u64) -> Grant {
        self.grant_or_revert(grant_id)
    }

    fn grant_or_revert(&self, grant_id: u64) -> Grant {
        self.grants
            .get(&grant_id)
            .unwrap_or_else(|| self.revert_with(GrantEscrowError::GrantNotFound))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::casper_types::U512;
    use odra::host::{Deployer, HostEnv, HostRef};

    fn env() -> HostEnv {
        odra_test::env()
    }

    fn setup() -> (HostEnv, GrantEscrowHostRef, Address, Address, Address) {
        let env = env();
        let funder = env.get_account(0);
        let builder = env.get_account(1);
        let releaser = env.get_account(2);
        env.set_caller(funder);
        let contract = GrantEscrow::deploy(&env, GrantEscrowInitArgs { authorized_releaser: releaser });
        (env, contract, funder, builder, releaser)
    }

    #[test]
    fn successful_initialization() {
        let (env, mut contract, funder, builder, releaser) = setup();
        env.set_caller(funder);
        contract.create_grant(1, builder, U512::from(10));
        assert_eq!(contract.get_grant(1).authorized_releaser, releaser);
    }

    #[test]
    fn successful_grant_creation() {
        let (_, mut contract, funder, builder, releaser) = setup();
        contract.create_grant(7, builder, U512::from(100));

        let grant = contract.get_grant(7);
        assert_eq!(grant.grant_id, 7);
        assert_eq!(grant.funder, funder);
        assert_eq!(grant.builder, builder);
        assert_eq!(grant.amount, U512::from(100));
        assert!(!grant.funded);
        assert!(!grant.released);
        assert_eq!(grant.authorized_releaser, releaser);
    }

    #[test]
    #[should_panic]
    fn duplicate_grant_rejection() {
        let (_, mut contract, _, builder, _) = setup();
        contract.create_grant(1, builder, U512::from(100));
        contract.create_grant(1, builder, U512::from(100));
    }

    #[test]
    #[should_panic]
    fn invalid_amount_rejection() {
        let (_, mut contract, _, builder, _) = setup();
        contract.create_grant(1, builder, U512::zero());
    }

    #[test]
    #[should_panic]
    fn unauthorized_funding_rejection() {
        let (env, mut contract, _, builder, _) = setup();
        contract.create_grant(1, builder, U512::from(100));
        env.set_caller(builder);
        contract.with_tokens(U512::from(100)).deposit_funds(1);
    }

    #[test]
    fn successful_funding() {
        let (env, mut contract, funder, builder, _) = setup();
        contract.create_grant(1, builder, U512::from(100));
        env.set_caller(funder);
        contract.with_tokens(U512::from(100)).deposit_funds(1);

        assert!(contract.get_grant(1).funded);
    }

    #[test]
    #[should_panic]
    fn double_funding_prevention() {
        let (env, mut contract, funder, builder, _) = setup();
        contract.create_grant(1, builder, U512::from(100));
        env.set_caller(funder);
        contract.with_tokens(U512::from(100)).deposit_funds(1);
        contract.with_tokens(U512::from(100)).deposit_funds(1);
    }

    #[test]
    #[should_panic]
    fn unauthorized_release_rejection() {
        let (env, mut contract, funder, builder, _) = setup();
        contract.create_grant(1, builder, U512::from(100));
        env.set_caller(funder);
        contract.with_tokens(U512::from(100)).deposit_funds(1);
        env.set_caller(builder);
        contract.release_payment(1);
    }

    #[test]
    fn successful_release() {
        let (env, mut contract, funder, builder, releaser) = setup();
        contract.create_grant(1, builder, U512::from(100));
        env.set_caller(funder);
        contract.with_tokens(U512::from(100)).deposit_funds(1);
        env.set_caller(releaser);
        contract.release_payment(1);

        assert!(contract.get_grant(1).released);
    }

    #[test]
    #[should_panic]
    fn double_release_prevention() {
        let (env, mut contract, funder, builder, releaser) = setup();
        contract.create_grant(1, builder, U512::from(100));
        env.set_caller(funder);
        contract.with_tokens(U512::from(100)).deposit_funds(1);
        env.set_caller(releaser);
        contract.release_payment(1);
        contract.release_payment(1);
    }
}
