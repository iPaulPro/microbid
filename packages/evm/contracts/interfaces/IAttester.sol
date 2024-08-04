// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Types } from "../constants/Types.sol";

interface IAttester {
	function isVerified(address _address) external view returns (bool);
	function createAttestation(
		Types.PoPSchema memory data
	) external returns (bytes32);
}
