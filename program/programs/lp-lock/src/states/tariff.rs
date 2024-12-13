use anchor_lang::prelude::*;

#[account]
pub struct Tariff {
  pub tariff_duration: [u16; 10],
  pub tariff_amount: [u8; 10],
  pub tariff_count: u8,
} 

impl Tariff{
  pub const LEN: usize = 8+ 20 + 10 + 1;
}