"use client";

import { useEffect, useState } from "react";
import {
  useSignerStatus,
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { auctionAbi } from "@/lib/abi/auctionAbi";
import { encodeFunctionData, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { erc20Abi } from "@/lib/abi/erc20Abi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GavelIcon, UserIcon } from "lucide-react";
import Countdown from "react-countdown";
import useInterval from "use-interval";
import AuctionAction from "@/components/AuctionAction";
import { LoadingSpinner } from "@/components/ui/spinner";
import { truncateAddress } from "@/lib/utils";

export default function Page({ params }: { params: { id: bigint } }) {
  const ZeroAddress = "0x0000000000000000000000000000000000000000";

  const [item, setItem] = useState<AuctionItem>();
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [estimatedEndTime, setEstimatedEndTime] = useState<bigint>();
  const [isSendingUserOperation, setIsSendingUserOperation] = useState(false);

  const { client } = useSmartAccountClient({ type: "LightAccount" });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const { sendUserOperationAsync } = useSendUserOperation({
    client,
    waitForTxn: true,
  });

  async function getAuctionItem(itemId: bigint) {
    const data = await publicClient.readContract({
      address: process.env.NEXT_PUBLIC_AUCTION_ADDRESS! as `0x${string}`,
      abi: auctionAbi,
      functionName: "getAuctionItem",
      args: [itemId],
    });
    console.log("getAuctionItem", data);

    const metadataURI = data.metadataURI.replace(
      "ar://",
      "https://arweave.net/",
    );
    const metadata: AuctionItemMetadata = await fetch(metadataURI).then((res) =>
      res.json(),
    );

    const item: AuctionItem = {
      id: params.id,
      isStarted: data.isStarted,
      totalBids: data.totalBids,
      latestBidder: data.latestBidder,
      isClaimed: data.claimed,
      metadata,
    };
    setItem(item);
    console.log("item", item);

    const endedData = await publicClient.readContract({
      address: process.env.NEXT_PUBLIC_AUCTION_ADDRESS! as `0x${string}`,
      abi: auctionAbi,
      functionName: "isAuctionEnded",
      args: [itemId],
    });
    setAuctionEnded(endedData);

    const estimatedEndTimeData = await publicClient.readContract({
      address: process.env.NEXT_PUBLIC_AUCTION_ADDRESS! as `0x${string}`,
      abi: auctionAbi,
      functionName: "getEstimatedEndTime",
      args: [itemId],
    });
    console.log("estimatedEndTimeData", estimatedEndTimeData);
    console.log(
      "estimatedEndTimeData",
      new Date(Number(estimatedEndTimeData) * 1000),
    );
    if (estimatedEndTimeData !== estimatedEndTime) {
      setEstimatedEndTime(estimatedEndTimeData);
    }
  }

  useInterval(
    () => {
      getAuctionItem(params.id);
    },
    2000,
    true,
  );

  async function placeBid() {
    if (!client) return;

    setIsSendingUserOperation(true);

    const data = encodeFunctionData({
      abi: auctionAbi,
      functionName: "placeBid",
      args: [params.id],
    });

    await sendUserOperationAsync({
      uo: {
        target: process.env.NEXT_PUBLIC_AUCTION_ADDRESS! as `0x${string}`,
        data,
      },
    });

    console.log("placeBid: placed");
    setIsSendingUserOperation(false);
  }

  async function submitClaim() {
    if (!client) return;

    setIsSendingUserOperation(true);

    const approveUSDCForAuction = encodeFunctionData({
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
        data: approveUSDCForAuction,
      },
    });

    console.log("buyBidTokens: approved auction for USDC");

    const data = encodeFunctionData({
      abi: auctionAbi,
      functionName: "claim",
      args: [params.id],
    });

    await sendUserOperationAsync({
      uo: {
        target: process.env.NEXT_PUBLIC_AUCTION_ADDRESS! as `0x${string}`,
        data,
      },
    });

    console.log("submitClaim: claimed");
    setItem((current) => ({ ...current!, isClaimed: true }));

    setIsSendingUserOperation(false);
  }

  if (!item)
    return (
      <div className="flex w-full min-h-[100dvh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  const Completionist = () => <span>Auction ended</span>;

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
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
      <div className="w-full grid md:grid-cols-2 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-12">
        <div className="grid gap-4 md:gap-10 items-start">
          <img
            src={item.metadata.image.replace(
              "ipfs://",
              "https://focalize.infura-ipfs.io/ipfs/",
            )}
            alt="Auction Item"
            width="600"
            height="600"
            className="aspect-square object-contain border w-full rounded-lg overflow-hidden"
          />
        </div>
        <div className="grid gap-4 md:gap-10 items-start py-4">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">{item.metadata.name}</h1>
            <p className="text-muted-foreground">{item.metadata.description}</p>
            <div className="flex items-center justify-between">
              <a href={item.metadata.url} target="_blank">
                More details
              </a>
              <div>
                Retail price: ${(Number(item.metadata.value) / 100).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">
                {auctionEnded ? "Final" : "Current"} price:
              </span>
              <span className="text-4xl font-bold text-primary">
                ${(Number(item.totalBids) / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Time remaining:</span>
              {auctionEnded ? (
                "Auction ended"
              ) : item.isStarted ? (
                <span className="text-2xl font-bold">
                  <Countdown
                    date={new Date(Number(estimatedEndTime) * 1000)}
                    key={estimatedEndTime}
                  >
                    <Completionist />
                  </Countdown>
                </span>
              ) : (
                "Starting soon..."
              )}
            </div>
            {item.latestBidder !== ZeroAddress && (
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Latest bidder:</span>
                <span className="text-lg font-bold">
                  {item.latestBidder === client?.getAddress()
                    ? "You"
                    : truncateAddress(item.latestBidder)}
                </span>
              </div>
            )}
          </div>

          <AuctionAction
            item={item}
            userAddress={client?.getAddress()}
            auctionEnded={auctionEnded}
            submitClaim={submitClaim}
            placeBid={placeBid}
            isSendingUserOperation={isSendingUserOperation}
          />
        </div>
      </div>
    </div>
  );
}
