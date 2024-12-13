'use client'
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";

import IDL from '../idl/lp_lock.json';
import {
  Program,
  AnchorProvider,
  setProvider,
  getProvider,
  Idl,
  utils,
  BN,
  Provider,
} from "@project-serum/anchor";
import {
  PROGRAM_ID,
  LP_MINT,
  LP_LOCK,
  ADMIN_ADDRESS,
  DECIMALS,
  LP_BUMP,
  TARIFF
} from "@/utils/constants";

import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";



const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("0");
  const [tariffAmount, setTariffAmount] = useState("0");
  const [tariffDuration, setTariffDuration] = useState("0");
  const [program, setProgram] = useState<Program>();
  const [User, setUser] = useState<PublicKey>();
  const [tariffModal, setTariffModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const wallet = useAnchorWallet();
  const {sendTransaction} = useWallet();
  const {connection} = useConnection();

  useEffect(() => {
    if (wallet) {

      (async function () {
        let provider: Provider;
        try {
          provider = getProvider();
        } catch {
          provider = new AnchorProvider(connection, wallet, {});
          setProvider(provider);
        }

        try {
          const program = new Program(IDL as Idl, PROGRAM_ID);
          setProgram(program);

          const [walletUser] = await PublicKey.findProgramAddress(
            [
              Buffer.from(utils.bytes.utf8.encode("lpuser")),
              wallet.publicKey.toBuffer(),
            ],
            program.programId
          );

          setUser(walletUser);

        } catch (err) {}

        // try {
        //   const { data } = await axios.get(
        //     `${process.env.NEXT_PUBLIC_BACKEND_API}/api/market-data`
        //   );
        //   setTokenPrice(data.price);
        //   setTokenSupply(data.supply);
        // } catch (err) {
        //   setTokenPrice(0);
        //   setTokenSupply(0);
        // }
      })();
    } else {
      // setEarnedYield(0);
      // setPorkDeposit(0);
      // setClaimableAmount(0);
      // setDailyBonus(0);
      // setPorkUserData(null);
      // setReferalLink("");
      // setReferrals([]);
    }
  }, [wallet]);

  const handleDeposit = async () => {
    // alert(LP_MINT + '\n' + wallet?.publicKey);
    if (!wallet || !program || !User) {
      return;
    }

    const amount = parseInt(depositAmount);

    if (!amount) {
      return;
    }

    if (amount < 10000) {
      toast.error("Minimum deposit is 10,000.", { duration: 3000 });
      return;
    }
    // const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdAzKzAy5Ga21Z1NxjWkzYyYdtMbhxoR6sc1ZK");
    // const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvRmvwRi7M9FEPfhkruSbMwCFotUHzzo5pxFJ");
    // alert(TOKEN_2022_PROGRAM_ID + '/n' + ASSOCIATED_TOKEN_PROGRAM_ID);

    const walletAta = getAssociatedTokenAddressSync(
      LP_MINT,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    // alert(walletAta);
    // console.log('jasdf')
    // console.log(walletAta)
    // console.log(LP_MINT);
    // console.log(wallet.publicKey);
    // console.log(walletAta);
    try {
      const info = await connection.getTokenAccountBalance(walletAta);

      console.log(info)

      if (!info.value.uiAmount) {
        toast.error("You have No LP Token.", { duration: 3000 });
        return;
      }

      if (info.value.uiAmount < amount) {
        toast.error("You don't have enough LP Tokens.", { duration: 3000 });
        return;
      }
    } catch (err) {
      toast.error("You have No LP Token!!!", { duration: 3000 });
      return;
    }

    setLoading(true);
    setDepositModal(false);

    // alert(LP_LOCK)
    const lockAta = getAssociatedTokenAddressSync(LP_MINT, LP_LOCK, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    // alert(lockAta)



    try {
      const deposit = new BN(amount).mul(DECIMALS);

      const randomKp = new Keypair();
      console.log("dsgfsdff", LP_MINT);
      const transaction = await program.methods
        .deposit(30, deposit)
        .accounts({
          lpMint: LP_MINT,
          from: wallet.publicKey,
          to: ADMIN_ADDRESS,
          fromAta: walletAta,
          // tariffData: ,
          lpLock: LP_LOCK,
          lockAta: lockAta,
          lpUser: User,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      toast.success("Successfully Deposited.", { duration: 3000 });
      setRefetch((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error("Failed to Deposit.", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleTariff = async () => {
    if (!wallet || !program || !User) {
      return;
    }

    const t_amount = parseInt(tariffAmount);
    const t_duration = parseInt(tariffDuration);
    if (!t_amount || !t_duration) {
      toast.error("input values", { duration: 3000 });
      return;
    }


    setLoading(true);
    setTariffModal(false);

    try {


      const transaction = await program.methods
        .add_or_update_tariff(t_duration, t_amount)
        .accounts({
          from: wallet.publicKey,
          tariff_data: TARIFF, 
        })

        .transaction();

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      toast.success("Successfully Deposited.", { duration: 3000 });
      setRefetch((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.success("Success to Add.", { duration: 3000 });
    } finally {
      setLoading(false);
    }

  }



  return (
    <div>
      <div className="flex flex-col w-[380px] xl:w-[1200px] 2xl:w-[1500px] mx-auto">
        <div className="flex justify-between h-[80px] px-[20px] sm:p-0">
          <div className="flex items-center gap-[4px]">
              <div className="hidden relative xl:flex items-center justify-center w-[180px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/deposit_lp.svg"
                  alt="Deposit LP Token"
                  className="absolute"
                  width={180}
                  height={60}
                  onClick={() => {
                    setDepositModal(true);
                  }}
                />
              </div>
              <WalletMultiButtonDynamic />
              <div className="hidden relative xl:flex items-center justify-center w-[180px] hover:cursor-pointer">
                <Image
                    src="/images/buttons/deposit_lp.svg"
                    alt="Add Tariff LP Token"
                    className="absolute"
                    width={180}
                    height={60}
                    onClick={() => {
                      setTariffModal(true);
                    }}
                  />
                </div>

            </div>
        </div>
      </div>

      
        {depositModal && (
          <div className="hidden xl:block modal-center z-20">
            <div className="relative flex w-[380px] h-[240px]">
              <Image
                src="/images/modal/close_pop_up.svg"
                alt="Close Pop Up"
                className="absolute right-0 top-0 z-[60] hover:cursor-pointer"
                width={40}
                height={40}
                onClick={() => {
                  setDepositModal(false);
                }}
              />
              <Image
                src="/images/modal/pop_up.svg"
                alt="Pop Up"
                className="absolute"
                fill
              />
              <div className="text-white z-10 font-lilitaone flex flex-col items-center w-full p-[12px]">
                <div className="text-[26px]">Deposit LP Token</div>
                <input
                  type="text"
                  spellCheck={false}
                  placeholder="Enter LP Token Amount"
                  value={depositAmount}
                  onChange={(e) => {
                    setDepositAmount(e.target.value);
                  }}
                  className="text-black indent-2 h-[50px] w-[340px] text-[20px] mt-[12px]"
                />
                <div className="flex gap-[12px] mt-[12px]">
                  <Image
                    src="/images/modal/deposit_lp.svg"
                    alt="Deposit"
                    className="hover:cursor-pointer"
                    width={166}
                    height={60}
                    onClick={() => {
                      handleDeposit();
                      // alert('deposit func');
                    }}
                  />
                  <Image
                    src="/images/modal/buy_pork.svg"
                    alt="Buy"
                    className="hover:cursor-pointer"
                    width={166}
                    height={60}
                    onClick={() => {
                      alert("Cash Out")

                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {tariffModal && (
          <div className="hidden xl:block modal-center z-20">
            <div className="relative flex w-[380px] h-[240px]">
              <Image
                src="/images/modal/close_pop_up.svg"
                alt="Close Pop Up"
                className="absolute right-0 top-0 z-[60] hover:cursor-pointer"
                width={40}
                height={40}
                onClick={() => {
                  setTariffModal(false);
                }}
              />
              <Image
                src="/images/modal/pop_up.svg"
                alt="Pop Up"
                className="absolute"
                fill
              />
              <div className="text-white z-10 font-lilitaone flex flex-col items-center w-full p-[12px]">
                <div className="text-[17px]">Add Tariff Option (Duration, Amount)</div>
                <input
                  type="text"
                  spellCheck={false}
                  placeholder="Enter Duration"
                  value={tariffDuration}
                  onChange={(e) => {
                    setTariffDuration(e.target.value);
                  }}
                  className="text-black indent-2 h-[50px] w-[340px] text-[20px] mt-[12px]"
                />
                <input
                  type="text"
                  spellCheck={false}
                  placeholder="Enter Tariff Amount (unit: 0.1 SOL)"
                  value={tariffAmount}
                  onChange={(e) => {
                    setTariffAmount(e.target.value);
                  }}
                  className="text-black indent-2 h-[50px] w-[340px] text-[20px] mt-[12px]"
                />
                <div className="flex gap-[12px] mt-[12px]">
                  <Image
                    src="/images/modal/deposit_lp.svg"
                    alt="Deposit"
                    className="hover:cursor-pointer"
                    width={166}
                    height={60}
                    onClick={() => {
                      handleTariff();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
    
  );
}
