"use client";

import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { useEffect, useState } from "react";
import { IDKitWidget, ISuccessResult } from "@worldcoin/idkit";
import { attesterAbi } from "@/lib/abi/attesterAbi";
import { erc20Abi } from "@/lib/abi/erc20Abi";
import { decodeAbiParameters, encodeFunctionData, formatUnits } from "viem";
import { popVerifierAbi } from "@/lib/abi/popVerifierAbi";
import { treasuryAbi } from "@/lib/abi/treasuryAbi";
import { Button } from "@/components/ui/button";

export default function Page() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const [proof, setProof] = useState<ISuccessResult>();
  const [verified, setVerified] = useState<boolean>(false);
  const [bidTokenBalance, setBidTokenBalance] = useState<bigint>(0n);
  const [usdcTokenBalance, setUsdcTokenBalance] = useState<bigint>(0n);

  const { client } = useSmartAccountClient({ type: "LightAccount" });

  const { sendUserOperationAsync, isSendingUserOperation } =
    useSendUserOperation({
      client,
      waitForTxn: true,
    });

  async function isVerified(): Promise<boolean> {
    if (!client || !user) return false;
    return client.readContract({
      address: process.env.NEXT_PUBLIC_ATTESTER_ADDRESS! as `0x${string}`,
      abi: attesterAbi,
      functionName: "isVerified",
      args: [client.getAddress()],
    });
  }

  async function getBalance(tokenAddress: `0x${string}`): Promise<bigint> {
    if (!client || !user) return 0n;
    return (await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [client.getAddress()],
    })) as Promise<bigint>;
  }

  useEffect(() => {
    if (verified) return;
    const fetchVerified = async () => {
      const verified = await isVerified();
      console.log("isVerified", verified, user);
      setVerified(verified);
    };
    fetchVerified();
  }, [client, proof]);

  useEffect(() => {
    if (!verified) return;
    const fetchBidTokenBalance = async () => {
      const balance = await getBalance(
        process.env.NEXT_PUBLIC_BID_TOKEN_ADDRESS! as `0x${string}`,
      );
      console.log("bid token balance", balance);
      setBidTokenBalance(balance);
    };
    fetchBidTokenBalance();

    const fetchUsdcTokenBalance = async () => {
      const balance = await getBalance(
        process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS! as `0x${string}`,
      );
      console.log("usdc token balance", balance);
      setUsdcTokenBalance(balance);
    };
    fetchUsdcTokenBalance();
  }, [verified]);

  function onProofSuccess(result: ISuccessResult) {
    console.log("IDKitWidget: onSuccess", result);
    setProof(result);
  }

  async function submitProof() {
    if (!client || !proof) return;
    const data = encodeFunctionData({
      abi: popVerifierAbi,
      functionName: "verify",
      args: [
        client.getAddress(),
        BigInt(proof.merkle_root),
        BigInt(proof.nullifier_hash),
        decodeAbiParameters(
          [{ type: "uint256[8]" }],
          proof.proof as `0x${string}`,
        )[0],
      ],
    });

    await sendUserOperationAsync({
      uo: {
        target: process.env.NEXT_PUBLIC_VERIFIER_ADDRESS! as `0x${string}`,
        data,
      },
    });
  }

  async function buyBidTokens() {
    if (!client) return;

    const approveData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [
        process.env.NEXT_PUBLIC_TREASURY_ADDRESS! as `0x${string}`,
        100_000_000n,
      ],
    });

    await sendUserOperationAsync({
      uo: {
        target: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS! as `0x${string}`,
        data: approveData,
      },
    });

    console.log("buyBidTokens: approved treasury for USDC");

    const data = encodeFunctionData({
      abi: treasuryAbi,
      functionName: "mintBidTokens",
      args: [client.getAddress(), 1000000n],
    });

    await sendUserOperationAsync({
      uo: {
        target: process.env.NEXT_PUBLIC_TREASURY_ADDRESS! as `0x${string}`,
        data,
      },
    });

    console.log("buyBidTokens: minted");

    const approveUSDCAuctionData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [
        process.env.NEXT_PUBLIC_AUCTION_ADDRESS! as `0x${string}`,
        1_000_000_000_000n,
      ],
    });

    await sendUserOperationAsync({
      uo: {
        target: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS! as `0x${string}`,
        data: approveUSDCAuctionData,
      },
    });

    console.log("buyBidTokens: approved auction for USDC");
  }

  if (signerStatus.isInitializing) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4 justify-center text-center">
      {user ? (
        <div className="flex flex-col gap-2 p-2">
          <p className="text-xl font-bold">Welcome!</p>
          <div>
            Logged in as{" "}
            <span className="font-bold">{user.email ?? "anon"}</span>.
            <p>{client?.getAddress()}</p>
          </div>
          {verified ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-green-700"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Proof of Personhood verified!
              </div>
              <p>Bid token balance: {bidTokenBalance.toString()}</p>
              <p>
                USDC balance: $
                {usdcTokenBalance > 0n
                  ? Number(formatUnits(usdcTokenBalance, 6)).toFixed(2)
                  : "0.00"}
              </p>
              <Button disabled={usdcTokenBalance === 0n} onClick={buyBidTokens}>
                Buy bid tokens
              </Button>
            </div>
          ) : proof ? (
            <Button
              className="mt-6"
              onClick={submitProof}
              disabled={isSendingUserOperation}
            >
              Submit Proof
            </Button>
          ) : (
            client && (
              <IDKitWidget
                app_id={
                  process.env.NEXT_PUBLIC_WORLD_ID_APP_ID! as `app_${string}`
                }
                action={process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID!}
                signal={client.getAddress()}
                onSuccess={onProofSuccess}
              >
                {({ open }) => (
                  <Button className="mt-6" onClick={open}>
                    Verify with World ID
                  </Button>
                )}
              </IDKitWidget>
            )
          )}
          <Button className="bg-secondary mt-6" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      ) : (
        <Button onClick={openAuthModal}>Login</Button>
      )}
    </main>
  );
}
