import React from "react";
import { Button } from "@/components/ui/button";

interface AuctionActionProps {
  item: AuctionItem;
  userAddress: `0x${string}` | undefined;
  auctionEnded: boolean;
  submitClaim: () => void;
  placeBid: () => void;
  isSendingUserOperation: boolean;
}

const AuctionAction: React.FC<AuctionActionProps> = ({
  item,
  userAddress,
  auctionEnded,
  submitClaim,
  placeBid,
  isSendingUserOperation,
}) => {
  const isWinner = item.latestBidder === userAddress;

  if (item.isClaimed && isWinner) {
    return (
      <p className="text-2xl font-bold border-t pt-4">
        🎉 Congratulations, you won!
      </p>
    );
  }

  if (auctionEnded && isWinner) {
    return (
      <div className="flex flex-col gap-2 justify-center">
        <p>You won the auction!</p>
        <Button
          size="lg"
          className="text-xl py-6"
          onClick={submitClaim}
          disabled={isSendingUserOperation}
        >
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
      disabled={!item.isStarted || auctionEnded || isSendingUserOperation}
    >
      Place Bid
    </Button>
  );
};

export default AuctionAction;
