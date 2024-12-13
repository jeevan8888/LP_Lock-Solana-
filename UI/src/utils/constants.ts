import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC as string;

const LP_MINT = new PublicKey(process.env.NEXT_PUBLIC_PORK_MINT as string);//

const PROGRAM_ID = "68ugLD3FDpXSbCyhFT5V4Y6Wz9adKDJ7WMQv9hP94Bsi";//

const LP_LOCK = new PublicKey("CNi3gmGK5WdPY6fi28PF4TUqwjMnoSTjStbUv8jpX6ct");//

const LP_BUMP = 254;

const TARIFF = new PublicKey("CNi3gmGK5WdPY6fi28PF4TUqwjMnoSTjStbUv8jpX6ct");/////////////////////

const ADMIN_ADDRESS = new PublicKey("4uT7yrbobSc1jy21kGamMF5eK7Se3XZeu4RGJp5CVBkb");//

const DECIMALS = new BN(1000_000_000);

export {
  RPC_ENDPOINT,
  LP_MINT,
  PROGRAM_ID,
  LP_LOCK,
  LP_BUMP,
  ADMIN_ADDRESS,
  DECIMALS,
  TARIFF,
}