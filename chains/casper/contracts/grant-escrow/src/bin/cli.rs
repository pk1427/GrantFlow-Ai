use grant_escrow::GrantEscrow;
use odra_cli::OdraCli;

fn main() {
    OdraCli::new().contract::<GrantEscrow>().build().run();
}
