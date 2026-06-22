use odra::casper_types::U512;
use odra::prelude::*;

#[odra::event]
pub struct GrantCreated {
    pub grant_id: u64,
    pub funder: Address,
    pub builder: Address,
    pub amount: U512,
}

#[odra::event]
pub struct FundsDeposited {
    pub grant_id: u64,
    pub funder: Address,
    pub builder: Address,
    pub amount: U512,
}

#[odra::event]
pub struct PaymentReleased {
    pub grant_id: u64,
    pub releaser: Address,
    pub builder: Address,
    pub amount: U512,
}
