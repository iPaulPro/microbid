// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBidToken} from "./interfaces/IBidToken.sol";
import {IAttester} from "./interfaces/IAttester.sol";
import {IFiatToken} from "./interfaces/IFiatToken.sol";

contract MicroBidTreasury is Ownable {
    using SafeERC20 for ERC20;

    error InvalidRecipient();
    error InvalidAmount();
    error UnauthorizedRecipient();

    event BidTokensMinted(address indexed recipient, uint256 amount);

    uint8 public constant BIDS_PER_DOLLAR = 10;

    uint256 internal constant USDC_DECIMALS = 10 ** 6;

    address public immutable usdc;
    IBidToken public immutable bidToken;
    IAttester public immutable attester;

    /**
     * @param owner The owner of the contract
	 * @param _usdc The USDC address
	 * @param _bidToken The bid token contract
	 * @param _attester The attester contract
	 */
    constructor(
        address owner,
        address _usdc,
        IBidToken _bidToken,
        IAttester _attester
    ) Ownable(owner) {
        usdc = _usdc;
        bidToken = _bidToken;
        attester = _attester;
    }

    function mintBidTokens(address to, uint256 amount) external {
        _validateMintInput(to, amount);
        _mintBidTokens(to, amount);
    }

    function mintBidTokensWithSig(
        address to,
        uint256 amount,
        uint256 deadline,
        bytes memory signature
    ) external {
        _validateMintInput(to, amount);

        // Approve the contract to spend the USDC
        IFiatToken(usdc).permit(to, address(this), amount, deadline, signature);

        // Mint the bid tokens
        _mintBidTokens(to, amount);
    }

    function withdraw(address recipient, uint256 amount) external onlyOwner {
        uint256 value = amount;
        if (value == 0) {
            value = ERC20(usdc).balanceOf(address(this));
        }
        ERC20(usdc).safeTransfer(recipient, value);
    }

    function _validateMintInput(address to, uint256 amount) internal view {
        if (to == address(0)) revert InvalidRecipient();
        if (amount < USDC_DECIMALS) revert InvalidAmount();
        if (!attester.isVerified(to)) revert UnauthorizedRecipient();
    }

    function _mintBidTokens(address to, uint256 amount) internal {
        // Calculate the whole number of USDC tokens to transfer
        uint256 wholeUSDC = amount - (amount % USDC_DECIMALS);

        // Transfer USDC tokens from the recipient to the contract
        ERC20(usdc).safeTransferFrom(to, address(this), wholeUSDC);

        // Calculate the number of bid tokens to mint
        uint256 mintAmount = wholeUSDC / USDC_DECIMALS * BIDS_PER_DOLLAR;

        // Mint the bid tokens
        bidToken.mint(to, mintAmount);

        emit BidTokensMinted(to, mintAmount);
    }
}
