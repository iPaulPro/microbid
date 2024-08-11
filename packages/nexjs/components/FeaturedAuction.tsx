import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { Button } from "@/components/ui/button";
import Countdown from "react-countdown";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import { auctionAbi } from "@/lib/abi/auctionAbi";
import useInterval from "use-interval";
import { GavelIcon } from "lucide-react";

interface AuctionCardProps {
  itemId: bigint;
}

const FeaturedAuction: FC<AuctionCardProps> = ({ itemId }) => {
  const [item, setItem] = useState<AuctionItem>();
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [estimatedEndTime, setEstimatedEndTime] = useState<bigint>();

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
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
      id: itemId,
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
      getAuctionItem(itemId);
    },
    10000,
    true,
  );

  if (!item) {
    return <div className="p-4 bg-card rounded-lg shadow">Loading...</div>;
  }

  const Completionist = () => <span>Auction ended</span>;

  return (
    <div className="w-full flex justify-between">
      <div className="w-full flex flex-col gap-2 items-start pr-4 flex-1">
        <div className="text-lg font-bold">Current Auction</div>
        <Link href={`/auction/${item.id}`} className="w-full">
          <div className="text-2xl font-bold">{item.metadata.name}</div>
        </Link>
        <div className="w-full flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {auctionEnded ? "Final" : "Current"} price:
          </span>
          <span className="text-xl font-bold text-primary">
            ${(Number(item.totalBids) / 100).toFixed(2)}
          </span>
        </div>
        <div className="w-full flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Time Remaining:</span>
          <span className="text-md font-bold">
            {auctionEnded ? (
              "Auction ended"
            ) : item.isStarted ? (
              <Countdown
                date={new Date(Number(estimatedEndTime) * 1000)}
                key={estimatedEndTime}
              >
                <Completionist />
              </Countdown>
            ) : (
              "Starting soon..."
            )}
          </span>
        </div>
        <Link href={`/auction/${item.id}`} className="pt-2 w-full">
          {auctionEnded ? (
            <Button variant="outline" size="sm" className="w-full">
              View Auction
            </Button>
          ) : (
            <Button size="lg" className="w-full text-lg">
              <GavelIcon className="mr-2" size={24} />
              Place a bid
            </Button>
          )}
        </Link>
      </div>
      <Link href={`/auction/${item.id}`} className="flex-1">
        <img
          src={item.metadata.image.replace(
            "ipfs://",
            "https://focalize.infura-ipfs.io/ipfs/",
          )}
          alt="Auction Item"
          width="600"
          height="600"
          className="aspect-square object-contain border w-full rounded-lg overflow-hidden w-full"
        />
      </Link>
    </div>
  );
};

export default FeaturedAuction;
