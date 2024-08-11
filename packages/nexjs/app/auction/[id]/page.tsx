"use client";

import { useEffect, useState } from "react";
import {
  useSignerStatus,
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { auctionAbi } from "@/lib/abi/auctionAbi";
import { encodeFunctionData } from "viem";
import { erc20Abi } from "@/lib/abi/erc20Abi";

export default function Page({ params }: { params: { id: bigint } }) {
  const signerStatus = useSignerStatus();

  const [item, setItem] = useState<AuctionItem>();
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [bidTokenBalance, setBidTokenBalance] = useState<bigint>(0n);

  const { client } = useSmartAccountClient({ type: "LightAccount" });

  const { sendUserOperationAsync, isSendingUserOperation } =
    useSendUserOperation({
      client,
      waitForTxn: true,
    });

  async function getAuctionItem(itemId: bigint) {
    console.log("getAuctionItem", itemId, client);
    if (!client) return;
    const data = await client.readContract({
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
      id: 1n,
      isStarted: data.isStarted,
      totalBids: data.totalBids,
      latestBidder: data.latestBidder,
      isClaimed: data.claimed,
      metadata,
    };
    setItem(item);
    console.log("item", item);

    const endedData = await client.readContract({
      address: process.env.NEXT_PUBLIC_AUCTION_ADDRESS! as `0x${string}`,
      abi: auctionAbi,
      functionName: "isAuctionEnded",
      args: [itemId],
    });
    setAuctionEnded(endedData);
  }

  useEffect(() => {
    console.log("signerStatus", signerStatus);
    console.log("client", client);
    getAuctionItem(params.id);
  }, [client?.account]);

  async function placeBid() {
    if (!client) return;

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
  }

  async function submitClaim() {
    if (!client) return;

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
  }

  // if (error) return <div>Failed to load</div>;
  if (!item) return <div>Loading...</div>;

  return (
    <div>
      <h1>{item?.metadata.title}</h1>
      <p>{item?.metadata.description}</p>
      {item?.metadata.image && (
        <img
          src={item?.metadata.image.replace("ipfs//", "https://ipfs.io/ipfs/")}
          alt={item?.metadata.title}
        />
      )}
      <p>Value: {item?.metadata.value}</p>
      <p>Total Bids: {item?.totalBids}</p>
      <p>Latest Bidder: {item?.latestBidder}</p>
      <p>Claimed: {item?.isClaimed ? "Yes" : "No"}</p>
      <p>Auction Ended: {auctionEnded ? "Yes" : "No"}</p>
      {item && !auctionEnded && (
        <button
          className="btn btn-primary"
          disabled={bidTokenBalance === 0n || !item?.isStarted}
          onClick={placeBid}
        >
          Place a bid
        </button>
      )}
      {item &&
        auctionEnded &&
        !item.isClaimed &&
        item.latestBidder === client?.getAddress() && (
          <div className="flex flex-col gap-2 justify-center">
            <p>You won the auction!</p>
            <button className="btn btn-primary" onClick={submitClaim}>
              Purchase Item ${(Number(item.totalBids) / 100).toFixed(2)}
            </button>
          </div>
        )}
    </div>
  );
}
