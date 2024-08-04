// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract MicroBidToken is ERC20, ERC20Permit, Ownable, AccessControl {
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

	constructor(
		address minter,
		address owner
	)
		ERC20("MicroBidToken", "MBT")
		ERC20Permit("MicroBidToken")
		Ownable(owner)
	{
		_grantRole(MINTER_ROLE, minter);
		_grantRole(BURNER_ROLE, minter);
	}

	function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
		_mint(to, amount);
	}

	function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
		_burn(from, amount);
	}
}
