// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Types} from "./constants/Types.sol";
import {MicroBidToken} from "./MicroBidToken.sol";
import {IAttester} from "./interfaces/IAttester.sol";

contract MicroBidAuction is Ownable, ReentrancyGuard {
    using SafeERC20 for ERC20;

    /**
     * @dev The amount the price increases with each bid in USDC
	 */
    uint16 internal constant PRICE_INCREASE_STEP = 10000; // a penny

    /**
     * @dev The initial duration of the auction in blocks
	 */
    uint16 internal constant INITIAL_DURATION_BLOCKS = 150; // around 5 min

    /**
     * @dev The duration of the auction extension, with each bid placed, in blocks
	 */
    uint16 internal constant EXTENSION_DURATION_BLOCKS = 10; // around 20 sec

    error AuctionAlreadyStarted();
    error AuctionNotStarted();
    error AuctionEnded();
    error AuctionNotEnded();
    error AuctionAlreadyClaimed();
    error UnauthorizedClaimer();
    error InsufficientFunds();
    error UnauthorizedCaller();
    error AlreadyWinning();

    event AuctionAdded(uint256 indexed id, string metadataURI);
    event AuctionStarted(uint256 indexed id, uint256 endBlock);
    event AuctionItemMetadataUpdated(uint256 indexed id, string metadataURI);
    event BidPlaced(
        uint256 indexed id,
        address indexed bidder,
        uint256 totalBids,
        uint256 endBlock
    );
    event AuctionClaimed(uint256 indexed id, address indexed claimer);

    MicroBidToken public immutable bidToken;
    address public immutable collateralToken;
    IAttester public immutable attester;
    address public immutable treasury;

    mapping(uint256 itemId => Types.AuctionItem item) public auctionItems;
    mapping(uint256 itemId => uint256 totalBids) public totalBidsOnItems;
    mapping(uint256 itemId => mapping(address bidder => uint256 numBids)) public bids;
    mapping(address bidder => uint256[] auctionIds) public userBidAuctions;

    uint256 public itemCount;

    constructor(
        address owner,
        MicroBidToken _bidToken,
        address _collateralToken,
        IAttester _attester,
        address _treasury
    ) Ownable(owner) {
        bidToken = _bidToken;
        collateralToken = _collateralToken;
        attester = _attester;
        treasury = _treasury;
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

    /**
     * @notice Get the list of auction IDs the given user has bid on
	 * @param user The address of the user
	 * @return The list of auction IDs
	 */
    function getUserBidAuctions(
        address user
    ) external view returns (uint256[] memory) {
        return userBidAuctions[user];
    }

    /**
     * @notice Get the estimated end time of the given item
	 * @param itemId The ID of the auction item
	 * @return The estimated end time
	 */
    function getEstimatedEndTime(uint256 itemId) public view returns (uint256) {
        Types.AuctionItem storage item = auctionItems[itemId];
        if (block.number >= item.endBlock) {
            return 0;
        }
        uint256 blocksRemaining = item.endBlock - block.number;
        return block.timestamp + (blocksRemaining * 2 seconds); // Assuming 2-second block times
    }

    /**
     * @notice Check if the auction has ended
	 * @param itemId The ID of the auction item
	 * @return True if the auction has ended
	 */
    function isAuctionEnded(uint256 itemId) public view returns (bool) {
        Types.AuctionItem storage item = auctionItems[itemId];
        return block.number >= item.endBlock;
    }

    /**
     * @notice Place a bid on the given item
	 * @param itemId The ID of the auction item
	 */
    function placeBid(uint256 itemId) external nonReentrant {
        Types.AuctionItem storage item = auctionItems[itemId];
        if (!item.isStarted) revert AuctionNotStarted();
        if (block.number >= item.endBlock) revert AuctionEnded();
        if (!attester.isVerified(msg.sender)) revert UnauthorizedCaller();
        if (bidToken.balanceOf(msg.sender) < 1) revert InsufficientFunds();
        if (item.latestBidder == msg.sender) revert AlreadyWinning();

        bidToken.burn(msg.sender, 1);

        item.totalBids = item.totalBids + 1;
        item.latestBidder = msg.sender;
        totalBidsOnItems[itemId] += 1;
        bids[itemId][msg.sender] += 1;

        if (block.number + EXTENSION_DURATION_BLOCKS > item.endBlock) {
            item.endBlock = block.number + EXTENSION_DURATION_BLOCKS;
        }

        // Add the auction to the user's list if it's their first bid
        if (bids[itemId][msg.sender] == 1) {
            userBidAuctions[msg.sender].push(itemId);
        }

        emit BidPlaced(
            itemId,
            msg.sender,
            totalBidsOnItems[itemId],
            item.endBlock
        );
    }

    function claim(
        uint256 itemId
    ) external {
        Types.AuctionItem storage item = auctionItems[itemId];

        if (block.number < item.endBlock) revert AuctionNotEnded();
        if (item.claimed) revert AuctionAlreadyClaimed();
        if (msg.sender != item.latestBidder) revert UnauthorizedClaimer();

        uint256 amount = item.totalBids * PRICE_INCREASE_STEP;
        if (ERC20(collateralToken).balanceOf(msg.sender) < amount) {
            revert InsufficientFunds();
        }

        ERC20(collateralToken).safeTransferFrom(msg.sender, treasury, amount);

        item.claimed = true;

        emit AuctionClaimed(itemId, msg.sender);
    }

    function claimWithSig(
        uint256 itemId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        Types.AuctionItem storage item = auctionItems[itemId];

        if (block.number < item.endBlock) revert AuctionNotEnded();
        if (item.claimed) revert AuctionAlreadyClaimed();
        if (msg.sender != item.latestBidder) revert UnauthorizedClaimer();

        uint256 amount = item.totalBids * PRICE_INCREASE_STEP;
        if (ERC20(collateralToken).balanceOf(msg.sender) < amount) {
            revert InsufficientFunds();
        }

        IERC20Permit(collateralToken).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        ERC20(collateralToken).safeTransferFrom(msg.sender, treasury, amount);

        item.claimed = true;

        emit AuctionClaimed(itemId, msg.sender);
    }

    /*
     * Owner functions
     */

    function addItem(string memory metadataURI) external onlyOwner {
        itemCount++;
        auctionItems[itemCount] = Types.AuctionItem({
            itemId: itemCount,
            isStarted: false,
            endBlock: 0,
            totalBids: 0,
            latestBidder: address(0),
            metadataURI: metadataURI,
            claimed: false
        });
        emit AuctionAdded(itemCount, metadataURI);
    }

    function startAuction(uint256 itemId) external onlyOwner {
        Types.AuctionItem storage item = auctionItems[itemId];
        if (item.isStarted) {
            revert AuctionAlreadyStarted();
        }
        item.isStarted = true;
        item.endBlock = block.number + INITIAL_DURATION_BLOCKS;
        emit AuctionStarted(itemId, item.endBlock);
    }

    function updateAuctionMetadata(
        uint256 itemId,
        string memory metadataURI
    ) external onlyOwner {
        Types.AuctionItem storage item = auctionItems[itemId];
        item.metadataURI = metadataURI;
        emit AuctionItemMetadataUpdated(itemId, metadataURI);
    }

    function recoverERC20(
        address to,
        address tokenAddress,
        uint256 tokenAmount
    ) external onlyOwner {
        ERC20(tokenAddress).transfer(to, tokenAmount);
    }
}
