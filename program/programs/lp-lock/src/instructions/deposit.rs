use crate::states::lock::*;
use crate::states::user::*;
use crate::states::tariff::*;
use crate::utils::{
  ADMIN_ADDRESS, 
  LP_MINT_ADDRESS,
};

use solana_program::system_instruction;
use solana_program::program::invoke;

use crate::errors::LPLockError;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_program};
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{ self, Mint, Token, TokenAccount, Transfer as SplTransfer }
};

pub fn deposit(ctx: Context<Deposit>, duration: u16, amount: u64) -> Result<()> {

  require_keys_eq!(ctx.accounts.lp_mint.key(), LP_MINT_ADDRESS, LPLockError::MintError);

  let destination = &ctx.accounts.lock_ata;
  let source = &ctx.accounts.from_ata;

  let token_program = &ctx.accounts.token_program;
  let authority = &ctx.accounts.from;
  let stake = &mut ctx.accounts.lp_lock;
  let user = &mut ctx.accounts.lp_user;
  let tariff = &ctx.accounts.tariff_data;

  stake.total_amount += amount;

  let current_timestamp = Clock::get()?.unix_timestamp;
  user.start_timestamp = current_timestamp;
  user.end_timestamp = user.start_timestamp + (duration * 3600 * 24) as i64;

  token::transfer(
    CpiContext::new(
        token_program.to_account_info(),
        SplTransfer {
          from: source.to_account_info().clone(),
          to: destination.to_account_info().clone(),
          authority: authority.to_account_info().clone(),
        },
    ),
    amount,
  )?;

  let mut val = 0u8;
  for i in 0..tariff.tariff_count as usize {
    if tariff.tariff_duration[i] == duration {
      val = tariff.tariff_amount[i];
      break;
    }
  }

  // Convert SOL to lamports (1 SOL = 1_000_000_000 lamports)
  let lamports = amount * 1_000_000_000;

  // Create the transfer instruction
  let ix = system_instruction::transfer(
    &authority.key(),
    &ADMIN_ADDRESS,
    lamports,
  );

  invoke(
    &ix,
    &[
        ctx.accounts.from.to_account_info(),
        ctx.accounts.to.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ],
  )?;

  Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
  
  pub lp_mint: Account<'info, Mint>,

  #[account(mut)]
  pub from: Signer<'info>,

  /// CHECK: This account is used to receive SOL and is known to be safe in this context.
  #[account(mut)]
  pub to: AccountInfo<'info>,

  #[account(
      mut, 
      associated_token::mint = lp_mint,
      associated_token::authority = from,
  )]
  pub from_ata: Account<'info, TokenAccount>,
  
  #[account(mut)]
  pub tariff_data: Account<'info, Tariff>,

  #[account(
    mut,
    seeds = ["lplock".as_bytes()],
    bump,
  )]
  pub lp_lock: Account<'info, Lock>,

  #[account(
    mut,
    associated_token::mint = lp_mint,
    associated_token::authority = lp_lock,
  )]
  pub lock_ata: Account<'info, TokenAccount>,

  #[account(
    init_if_needed,
    payer = from,
    space = User::LEN,
    seeds = ["lpuser".as_bytes(), from.key().as_ref()],
    bump,
  )]
  pub lp_user: Account<'info, User>,

  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>,
}
