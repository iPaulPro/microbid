// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { MicroBidToken } from "./MicroBidToken.sol";

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
}

contract MicroBidAuction is Ownable, ReentrancyGuard {
	using SafeERC20 for ERC20;

	/**
	 * @dev The amount the price increases with each bid
	 */
	uint8 internal constant PRICE_INCREASE_STEP = 100;

	uint16 internal constant INITIAL_DURATION_BLOCKS = 300;

	MicroBidToken public bidToken;

	error AuctionAlreadyStarted();
	error AuctionNotActive();
	error AuctionEnded();

	event AuctionAdded(uint256 indexed id, string metadataURI);
	event AuctionStarted(uint256 indexed id, string metadataURI);
	event BidPlaced(uint256 indexed id, address indexed bidder, uint256 amount);

	mapping(uint256 itemId => AuctionItem item) public auctionItems;
	mapping(uint256 itemId => uint256 totalBids) public totalBidsOnItems;
	mapping(uint256 itemId => mapping(address bidder => uint256 numBids))
		public bids;

	uint256 public itemCount;

	constructor(address owner, MicroBidToken _bidToken) Ownable(owner) {
		bidToken = _bidToken;
	}

	function getAuctionItem(
		uint256 itemId
	) external view returns (AuctionItem memory) {
		return auctionItems[itemId];
	}

	function getTotalBids(uint256 itemId) external view returns (uint256) {
		return totalBidsOnItems[itemId];
	}

	function getBids(
		uint256 itemId,
		address bidder
	) external view returns (uint256) {
		return bids[itemId][bidder];
	}

	function getCurrentPrice(uint256 itemId) external view returns (uint256) {
		AuctionItem storage item = auctionItems[itemId];
		return item.totalBids * PRICE_INCREASE_STEP;
	}

	function addItem(string memory metadataURI) external onlyOwner {
		uint256 itemId = itemCount++;
		auctionItems[itemId] = AuctionItem({
			itemId: itemId,
			isActive: false,
			endBlock: 0,
			totalBids: 0,
			highestBidder: address(0),
			metadataURI: metadataURI
		});
		emit AuctionAdded(itemId, metadataURI);
	}

	function startAuction(
		uint256 itemId,
		string calldata metadataURI
	) external onlyOwner {
		AuctionItem storage item = auctionItems[itemId];
		if (item.isActive) {
			revert AuctionAlreadyStarted();
		}
		item.isActive = true;
		item.endBlock = block.number + INITIAL_DURATION_BLOCKS;
		emit AuctionStarted(itemId, metadataURI);
	}

	function placeBid(uint256 itemId, uint256 amount) external nonReentrant {
		AuctionItem storage item = auctionItems[itemId];
		if (!item.isActive) {
			revert AuctionNotActive();
		}
		if (block.number >= item.endBlock) {
			revert AuctionEnded();
		}

		// TODO ensure bidder holds PoP credential

		bidToken.safeTransferFrom(msg.sender, address(this), amount);

		item.totalBids = item.totalBids + 1;
		item.highestBidder = msg.sender;
		totalBidsOnItems[itemId] += 1;
		bids[itemId][msg.sender] += 1;

		emit BidPlaced(itemId, msg.sender, amount);
	}
}
