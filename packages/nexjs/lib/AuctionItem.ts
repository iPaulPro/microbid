interface AuctionItemMetadata {
  name: string;
  description: string;
  image: string;
  value: bigint;
  url: string;
  attributes: { key: string; value: string }[];
}

interface AuctionItem {
  id: bigint;
  isStarted: boolean;
  totalBids: bigint;
  latestBidder: `0x${string}`;
  metadata: AuctionItemMetadata;
  isClaimed: boolean;
}
