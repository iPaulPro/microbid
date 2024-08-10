// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Types {
    /**
     * @notice A struct containing information about an auction item
	 * @param itemId The ID of the auction item
	 * @param isActive Whether the auction is active
	 * @param endBlock The block at which the auction ends
	 * @param totalBids The total number of bids on the auction
	 * @param latestBidder The address of the latest bidder
	 * @param metadataURI The URI of the metadata for the item
	 * @param claimed Whether the item has been claimed
	 */
    struct AuctionItem {
        uint256 itemId;
        bool isActive;
        uint256 endBlock;
        uint256 totalBids;
        address latestBidder;
        string metadataURI;
        bool claimed;
    }

    /**
     * @notice A struct containing information about a Proof of Personhood schema
	 * @param nullifierHash The hash of the nullifier
	 */
    struct PoPSchema {
        uint256 nullifierHash;
    }
}
