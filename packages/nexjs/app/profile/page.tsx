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
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { GavelIcon, UserIcon } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/spinner";
import { auctionAbi } from "@/lib/abi/auctionAbi";
import AuctionCard from "@/components/AuctionCard";

export default function Page() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const [proof, setProof] = useState<ISuccessResult>();
  const [verified, setVerified] = useState<boolean>(false);
  const [bidTokenBalance, setBidTokenBalance] = useState<bigint>(0n);
  const [usdcTokenBalance, setUsdcTokenBalance] = useState<bigint>(0n);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [balanceRefCounter, setBalanceRefCounter] = useState(0);
  const [isBuying, setIsBuying] = useState(false);
  const [auctions, setAuctions] = useState<readonly bigint[]>([]);

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

  async function getAuctions() {
    if (!client) return;
    const auctionIds = await client.readContract({
      address: process.env.NEXT_PUBLIC_AUCTION_ADDRESS! as `0x${string}`,
      abi: auctionAbi,
      functionName: "getUserBidAuctions",
      args: [client.getAddress()],
    });
    console.log("getAuctions", auctionIds);
    setAuctions(auctionIds);
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
  }, [verified, balanceRefCounter]);

  useEffect(() => {
    if (!verified) return;
    getAuctions();
  }, [verified]);

  async function onProofSuccess(proof: ISuccessResult) {
    console.log("IDKitWidget: onSuccess", proof);
    if (!client) return;

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

    console.log("onProofSuccess: verified");
    setProof(proof);
  }

  async function buyBidTokens(amount: number) {
    if (!client) return;

    setIsBuying(true);

    const approveData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [
        process.env.NEXT_PUBLIC_TREASURY_ADDRESS! as `0x${string}`,
        1_000_000_000_000n,
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
      args: [client.getAddress(), BigInt(amount) * 1000000n],
    });

    await sendUserOperationAsync({
      uo: {
        target: process.env.NEXT_PUBLIC_TREASURY_ADDRESS! as `0x${string}`,
        data,
      },
    });

    console.log("buyBidTokens: minted");
    setBidDialogOpen(false);
    setBalanceRefCounter((prev) => prev + 1);

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

  async function copyWalletAddress() {
    await navigator.clipboard.writeText(client?.getAddress() ?? "");
  }

  if (signerStatus.isInitializing) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24 gap-4 justify-center text-center">
        <Button onClick={openAuthModal}>Login</Button>
      </main>
    );
  }

  if (!verified) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24 gap-4 justify-center text-center">
        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID! as `app_${string}`}
          action={process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID!}
          signal={client?.getAddress()}
          onSuccess={onProofSuccess}
        >
          {({ open }) => <Button onClick={open}>Verify with World ID</Button>}
        </IDKitWidget>
      </main>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-muted">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link
          href="#"
          className="flex items-center justify-center gap-2"
          prefetch={false}
        >
          <GavelIcon className="h-6 w-6" />
          <span className="font-bold text-primary">Microbid</span>
        </Link>
        <Link href="/profile" className="rounded-full border p-2">
          <UserIcon className="w-6 h-6 overflow-hidden" />
        </Link>
      </header>
      <div className="flex flex-col gap-8 p-6 sm:p-8 md:p-10 lg:p-12 rounded-xl">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="bg-primary text-primary-foreground font-semibold flex items-center justify-center">
                <UserIcon />
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
                <Button
                  variant="link"
                  className="p-0 h-fit w-fit"
                  onClick={() => logout()}
                >
                  Log out
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid gap-1 text-right">
                <div className="font-medium">
                  {truncateAddress(client?.getAddress())}
                </div>
                <div className="text-sm text-muted-foreground">
                  Smart Wallet Address
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={copyWalletAddress}>
                Copy
              </Button>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  USDC Balance
                </div>
                <div className="font-medium">
                  $
                  {usdcTokenBalance > 0n
                    ? Number(formatUnits(usdcTokenBalance, 6)).toFixed(2)
                    : "0.00"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Bid Tokens</div>
                <div className="font-medium">{bidTokenBalance.toString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button variant="outline" size="sm">
                Withdraw
              </Button>
              <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Buy Bid Tokens</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  {isBuying ? (
                    <div className="flex gap-2 items-center justify-center h-48">
                      Buying tokens...
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div>
                      <DialogHeader>
                        <DialogTitle>Bid Packs</DialogTitle>
                        <DialogDescription>
                          Choose from our selection of bid packs to get started
                          on your penny auction journey.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 grid-cols-2">
                        <div className="grid gap-4 p-4 bg-card rounded-lg shadow">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">
                              Starter Pack
                            </h3>
                            <div className="text-2xl font-bold">$1</div>
                          </div>
                          <p className="text-muted-foreground">
                            10 bids to get you started on your penny auction
                            adventure.
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-muted-foreground">10 Bids</div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => buyBidTokens(1)}
                            >
                              Buy Now
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-4 p-4 bg-card rounded-lg shadow">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Pro Pack</h3>
                            <div className="text-2xl font-bold">$5</div>
                          </div>
                          <p className="text-muted-foreground">
                            50 bids to help you win more auctions.
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-muted-foreground">50 Bids</div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => buyBidTokens(5)}
                            >
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">My Auctions</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {auctions.map((auctionId) => (
              <AuctionCard
                itemId={auctionId}
                userAddress={client?.getAddress()}
                key={auctionId.toString()}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
