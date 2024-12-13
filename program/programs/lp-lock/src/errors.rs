use anchor_lang::error_code;

#[error_code]
pub enum LPLockError {
  StakeBumpError,
  MinimumDepositError,
  MintError,
  CashOutError,
  TimeError,
  AdminError,
}
