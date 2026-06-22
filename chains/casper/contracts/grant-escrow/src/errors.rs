use odra::prelude::*;

#[odra::odra_error]
pub enum GrantEscrowError {
    GrantAlreadyExists = 1,
    GrantNotFound = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    AlreadyFunded = 5,
    NotFunded = 6,
    AlreadyReleased = 7,
    TransferFailed = 8,
}

pub trait RevertExt {
    fn revert_with(&self, error: GrantEscrowError) -> !;
}

impl<T: Revertible> RevertExt for T {
    fn revert_with(&self, error: GrantEscrowError) -> ! {
        self.revert(error)
    }
}
