use crate::states::tariff::*;
use crate::utils::*;
use crate::errors::LPLockError;
use anchor_lang::prelude::*;
// use anchor_spl::{
//   associated_token::AssociatedToken,
//   token::{self, Mint, Token, TokenAccount, Transfer as SplTransfer}
// };

pub fn add_or_update_tariff(ctx: Context<AddOrUpdateTariff>, duration: u16, amount: u8) -> Result<()> {

  require_keys_eq!(ctx.accounts.from.key(), ADMIN_ADDRESS, LPLockError::AdminError);

  let tariff = &mut ctx.accounts.tariff_data;
  let count = tariff.tariff_count as usize;

  tariff.tariff_count += 1;
  tariff.tariff_duration[count] = duration;
  tariff.tariff_amount[count] = amount;
  Ok(())
}

#[derive(Accounts)]
pub struct AddOrUpdateTariff<'info> {
  #[account(mut)]
  pub from: Signer<'info>,

  #[account(
    mut,
    seeds = ["tariff".as_bytes()],
    bump,
  )]
  pub tariff_data: Account<'info, Tariff>,
}