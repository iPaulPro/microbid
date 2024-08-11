import React from "react";
import { Button } from "@/components/ui/button";

interface AuctionActionProps {
  item: AuctionItem;
  userAddress: `0x${string}` | undefined;
  auctionEnded: boolean;
  submitClaim: () => void;
  placeBid: () => void;
}

const AuctionAction: React.FC<AuctionActionProps> = ({
  item,
  userAddress,
  auctionEnded,
  submitClaim,
  placeBid,
}) => {
  const isWinner = item.latestBidder === userAddress;

  if (item.isClaimed && isWinner) {
    return <p className="text-2xl border-t pt-4">🎉 Congratulations!</p>;
  }

  if (auctionEnded && isWinner) {
    return (
      <div className="flex flex-col gap-2 justify-center">
        <p>You won the auction!</p>
        <Button size="lg" className="text-xl py-6" onClick={submitClaim}>
          Purchase Item ${(Number(item.totalBids) / 100).toFixed(2)}
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="lg"
      className="text-xl py-6"
      onClick={placeBid}
      disabled={!item.isStarted || auctionEnded}
    >
      Place Bid
    </Button>
  );
};

export default AuctionAction;
