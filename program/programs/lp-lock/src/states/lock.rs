use anchor_lang::prelude::*;

#[account]
pub struct Lock {
  pub total_amount: u64,
} 

impl  Lock{
  pub const LEN: usize = 8 + 16;
}