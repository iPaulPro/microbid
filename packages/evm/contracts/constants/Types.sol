// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Types {
	/**
	 * @notice A struct containing information about an auction item
	 */
	struct AuctionItem {
		uint256 itemId;
		bool isActive;
		uint256 endBlock;
		uint256 totalBids;
		address highestBidder;
		string metadataURI;
		bool claimed;
	}
}
