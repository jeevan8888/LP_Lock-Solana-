use crate::states::lock::*;
use crate::states::user::*;
use crate::utils::{
  ADMIN_ADDRESS,
  LP_MINT_ADDRESS,
};
use crate::errors::LPLockError;
use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{ self, Mint, Token, TokenAccount, Transfer as SplTransfer }
};


pub fn cashout(ctx: Context<CashOut>, stake_bump: u64) -> Result<()> {

  require_keys_eq!(ctx.accounts.lp_mint.key(), LP_MINT_ADDRESS, LPLockError::MintError);
  
  let destination = &ctx.accounts.to_ata;
  let source = &ctx.accounts.lock_ata;
  let authority = &ctx.accounts.to;
  let token_program = &ctx.accounts.token_program;
  let lock = &mut ctx.accounts.lp_lock;
  let user = &mut ctx.accounts.pork_user;

  let mut amount: u64 = user.locked_amount;

//   let mut amount: u64 = user.claimable_amount;

  let current_timestamp = Clock::get()?.unix_timestamp;

  require_gte!(current_timestamp, user.end_timestamp, LPLockError::TimeError);
  require_gte!(amount, stake_bump, LPLockError::CashOutError);

  lock.total_amount -= stake_bump;
  user.locked_amount -= stake_bump;

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


  Ok(())
}

#[derive(Accounts)]
#[instruction(stake_bump: u8)]
pub struct CashOut<'info> {
  
  pub lp_mint: Account<'info, Mint>,

  #[account(mut)]
  pub to: Signer<'info>,

  #[account(
      init_if_needed,
      payer = to,
      associated_token::mint = lp_mint,
      associated_token::authority = to,
  )]
  pub to_ata: Account<'info, TokenAccount>,

  #[account(mut)]
  pub lp_lock: Account<'info, Lock>,

  #[account(
    mut,
    associated_token::mint = lp_mint,
    associated_token::authority = lp_lock,
  )]
  pub lock_ata: Account<'info, TokenAccount>,

  #[account(mut)]
  pub pork_user: Account<'info, User>,

  
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>
}
