// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBidToken is IERC20, IERC20Permit {
	function mint(address to, uint256 amount) external;

	function burn(address from, uint256 amount) external;
}