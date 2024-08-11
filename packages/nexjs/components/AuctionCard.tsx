import React, { useState } from "react";
import { auctionAbi } from "@/lib/abi/auctionAbi";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Countdown from "react-countdown";
import { TrophyIcon } from "lucide-react";

interface AuctionCardProps {
  itemId: bigint;
  userAddress: `0x${string}` | undefined;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ itemId, userAddress }) => {
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

  React.useEffect(() => {
    getAuctionItem(itemId);
  }, [itemId]);

  if (!item) {
    return <div className="p-4 bg-card rounded-lg shadow">Loading...</div>;
  }

  const Completionist = () => <span>Auction ended</span>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            {item.metadata.name}
            {item.isClaimed && item.latestBidder === userAddress && (
              <TrophyIcon className="text-primary" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start pr-4">
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
          <div className="grid gap-4 md:gap-10 items-start">
            <div className="grid gap-3">
              <p className="text-muted-foreground text-sm">
                {item.metadata.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-md font-medium">
                  {auctionEnded ? "Final" : "Current"} price:
                </span>
                <span className="text-xl font-bold text-primary">
                  ${(Number(item.totalBids) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-md font-medium">Time Remaining:</span>
                <span className="text-lg font-bold">
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
              <Button variant="outline" size="sm" className="mt-2">
                View Auction
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuctionCard;
