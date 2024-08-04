// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Types } from "./constants/Types.sol";

contract MicroBidAuction is Ownable, ReentrancyGuard {
	using SafeERC20 for ERC20;

	/**
	 * @dev The amount the price increases with each bid
	 */
	uint16 internal constant PRICE_INCREASE_STEP = 10000; // a penny

	uint16 internal constant INITIAL_DURATION_BLOCKS = 300;
	uint16 internal constant EXTENSION_DURATION_BLOCKS = 10;

	error AuctionAlreadyStarted();
	error AuctionNotActive();
	error AuctionEnded();
	error AuctionNotEnded();
	error AuctionAlreadyClaimed();

	event AuctionAdded(uint256 indexed id, string metadataURI);
	event AuctionStarted(uint256 indexed id);
	event AuctionItemMetadataUpdated(uint256 indexed id, string metadataURI);
	event BidPlaced(
		uint256 indexed id,
		address indexed bidder,
		uint256 totalBids,
		uint256 endBlock
	);

	mapping(uint256 itemId => Types.AuctionItem item) public auctionItems;
	mapping(uint256 itemId => uint256 totalBids) public totalBidsOnItems;
	mapping(uint256 itemId => mapping(address bidder => uint256 numBids))
		public bids;

	ERC20 public bidToken;
	ERC20 public collateralToken;

	uint256 public itemCount;

	constructor(
		address owner,
		ERC20 _bidToken,
		ERC20 _collateralToken
	) Ownable(owner) {
		bidToken = _bidToken;
		collateralToken = _collateralToken;
	}

	/**
	 * @notice Get the auction item with the given ID
	 * @param itemId The ID of the auction item
	 * @return The auction item
	 */
	function getAuctionItem(
		uint256 itemId
	) external view returns (Types.AuctionItem memory) {
		return auctionItems[itemId];
	}

	/**
	 * @notice Get the total number of bids on the given item
	 * @param itemId The ID of the auction item
	 * @return The total number of bids
	 */
	function getTotalBids(uint256 itemId) external view returns (uint256) {
		return totalBidsOnItems[itemId];
	}

	/**
	 * @notice Get the number of bids the given bidder has placed on the given item
	 * @param itemId The ID of the auction item
	 * @param bidder The address of the bidder
	 * @return The number of bids
	 */
	function getBids(
		uint256 itemId,
		address bidder
	) external view returns (uint256) {
		return bids[itemId][bidder];
	}

	/**
	 * @notice Get the current USDC price of the given item
	 * @param itemId The ID of the auction item
	 * @return The current price
	 */
	function getCurrentPrice(uint256 itemId) external view returns (uint256) {
		Types.AuctionItem storage item = auctionItems[itemId];
		return item.totalBids * PRICE_INCREASE_STEP;
	}

	function addItem(string memory metadataURI) external onlyOwner {
		uint256 itemId = itemCount++;
		auctionItems[itemId] = Types.AuctionItem({
			itemId: itemId,
			isActive: false,
			endBlock: 0,
			totalBids: 0,
			highestBidder: address(0),
			metadataURI: metadataURI,
			claimed: false
		});
		emit AuctionAdded(itemId, metadataURI);
	}

	function startAuction(uint256 itemId) external onlyOwner {
		Types.AuctionItem storage item = auctionItems[itemId];
		if (item.isActive) {
			revert AuctionAlreadyStarted();
		}
		item.isActive = true;
		item.endBlock = block.number + INITIAL_DURATION_BLOCKS;
		emit AuctionStarted(itemId);
	}

	function updateAuctionMetadata(
		uint256 itemId,
		string memory metadataURI
	) external onlyOwner {
		Types.AuctionItem storage item = auctionItems[itemId];
		item.metadataURI = metadataURI;
		emit AuctionItemMetadataUpdated(itemId, metadataURI);
	}

	function placeBid(uint256 itemId) external nonReentrant {
		Types.AuctionItem storage item = auctionItems[itemId];
		if (!item.isActive) {
			revert AuctionNotActive();
		}
		if (block.number >= item.endBlock) {
			revert AuctionEnded();
		}

		// TODO ensure bidder holds PoP credential

		bidToken.safeTransferFrom(msg.sender, address(this), 1);

		item.totalBids = item.totalBids + 1;
		item.highestBidder = msg.sender;
		item.endBlock = block.number + EXTENSION_DURATION_BLOCKS;
		totalBidsOnItems[itemId] += 1;
		bids[itemId][msg.sender] += 1;

		emit BidPlaced(
			itemId,
			msg.sender,
			totalBidsOnItems[itemId],
			item.endBlock
		);
	}

	function claim(uint256 itemId) external onlyOwner {
		Types.AuctionItem storage item = auctionItems[itemId];
		if (item.isActive || block.number < item.endBlock) {
			revert AuctionNotEnded();
		}
		if (item.claimed) {
			revert AuctionAlreadyClaimed();
		}

		item.claimed = true;
		uint amount = item.totalBids * PRICE_INCREASE_STEP;
		collateralToken.safeTransfer(owner(), amount);
	}
}
