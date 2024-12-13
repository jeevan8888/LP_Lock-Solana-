use crate::states::lock::*;
use crate::states::tariff::*;
use crate::utils::*;

use anchor_lang::prelude::*;
// use anchor_lang::system_program;
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{ Mint, Token,  }
};
use crate::errors::LPLockError;

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {

  require_keys_eq!(ctx.accounts.lp_mint.key(), LP_MINT_ADDRESS, LPLockError::MintError);
  
  let lock = &mut ctx.accounts.lp_lock;
  let tariff = &mut ctx.accounts.tariff_data;
  
  lock.total_amount = 0;

  tariff.tariff_count = 3;
  tariff.tariff_duration[0] = 30;
  tariff.tariff_duration[1] = 60;
  tariff.tariff_duration[2] = 90;
  
  tariff.tariff_amount[0] = 5;
  tariff.tariff_amount[1] = 7;
  tariff.tariff_amount[2] = 10;
  
  Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {

  pub lp_mint: Account<'info, Mint>,

  #[account(mut)]
  pub from: Signer<'info>,

  #[account(
    init, 
    payer = from,
    space=Tariff::LEN,
  )]
  pub tariff_data: Account<'info, Tariff>,


  #[account(
    init,
    payer = from,
    space=Lock::LEN,
  )]
  pub lp_lock: Account<'info, Lock>,

  pub system_program: Program<'info, System>,
  token_program: Program<'info, Token>,
  associated_token_program: Program<'info, AssociatedToken>,
  
}


