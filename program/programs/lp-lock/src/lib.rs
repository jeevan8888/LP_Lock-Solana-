use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod states;
pub mod utils;
pub mod errors;

declare_id!("Y7RsoTpU1qkwVxUHTFA2vwozvHzLoGrgyy6zXFPDjpE");

#[program]
pub mod lp_lock {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::initialize(ctx);
        Ok(())
    }
    
    pub fn deposit(ctx: Context<Deposit>,duration: u8, amount: u64) -> Result<()> {
        instructions::deposit::deposit(ctx, duration.into(), amount);
        Ok(())
    }

    pub fn cashout(ctx: Context<CashOut>, stake_bump: u64) -> Result<()> {
        instructions::cashout::cashout(ctx, stake_bump);
        Ok(())
    }

    pub fn add_or_update_tariff(ctx: Context<AddOrUpdateTariff>, duration: u16, amount: u8) -> Result<()> {
        instructions::addorupdatetariff::add_or_update_tariff(ctx, duration, amount);
        Ok(())
    }
    pub fn transfer_to_pda(ctx: Context<Example>, fund_lamports: u64)-> Result<()>{
        let pda = &mut ctx.account.pda;
        let signer= &mut ctx.accounts.signer;
        let system_program = &ctx.accounts.system_program;

        let pda_balance_before = pda.get_lamports();

        transfer(
            CpiContext::new(
                system_program.to_account_info(),
                Transfer{
                    from: signer.to_account_info(),
                    to: pda.to_account_info(),
                },
            ),
            fund_lamports,
        )?;

        let lamports = ctx.accounts.pda.get_lamports();
        OK(())
    }
}