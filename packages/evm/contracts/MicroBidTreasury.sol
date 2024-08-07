// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IBidToken } from "./interfaces/IBidToken.sol";
import { IAttester } from "./interfaces/IAttester.sol";

contract MicroBidTreasury is Ownable {
	using SafeERC20 for ERC20;

	error UnauthorizedRecipient();

	address public immutable usdc;
	IBidToken public immutable bidToken;
	IAttester public immutable attester;

	/**
	 * @param owner The owner of the contract
	 * @param _usdc The USDC address
	 * @param _bidToken The bid token address
	 * @param _attester The attester address
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

	function mintBidTokens(
		address to,
		uint256 amount,
		uint256 deadline,
		uint8 v,
		bytes32 r,
		bytes32 s
	) external onlyOwner {
		if (!attester.isVerified(to)) {
			revert UnauthorizedRecipient();
		}

		ERC20Permit(usdc).permit(to, address(this), amount, deadline, v, r, s);
		ERC20(usdc).safeTransferFrom(to, address(this), amount);

		bidToken.mint(to, amount);
	}

	function withdraw(address recipient, uint256 amount) external onlyOwner {
		ERC20(usdc).safeTransfer(recipient, amount);
	}
}
