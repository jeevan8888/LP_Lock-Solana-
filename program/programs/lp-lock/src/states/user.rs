use anchor_lang::prelude::*;

#[account]
pub struct User {
  pub locked_amount: u64,
  pub start_timestamp: i64,
  pub end_timestamp: i64,
}

impl User {
  pub const LEN: usize = 8 + 8 + 8 + 8;
}