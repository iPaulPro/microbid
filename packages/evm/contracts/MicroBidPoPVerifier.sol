// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IWorldID } from "./interfaces/IWorldID.sol";
import { IAttester } from "./interfaces/IAttester.sol";
import { Types } from "./constants/Types.sol";
import { ByteHasher } from "./utils/ByteHasher.sol";

contract MicroBidPoPVerifier is Ownable, ReentrancyGuard {
	using ByteHasher for bytes;

	/// @notice Thrown when attempting to reuse a nullifier
	error InvalidNullifier();
	error AttesterNotSet();

	event ContractDeployed();

	/// @dev Emitted when a user successfully verifies their proof.
	/// @param user The address of the user who submitted the proof.
	event VerificationSuccessful(address indexed user);

	/// @dev Emitted when the attester for the contract is set or updated.
	/// @param attester The address of the attester.
	event AttesterUpdated(address indexed attester);

	/// @dev The World ID instance that will be used for verifying proofs
	IWorldID internal immutable worldId;

	/// @dev The contract's external nullifier hash
	uint256 internal immutable externalNullifier;

	/// @dev The World ID group ID
	uint8 internal immutable groupId = 1;

	/// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
	mapping(uint256 => bool) internal nullifierHashes;

	IAttester public attester;

	/// @param _worldId The WorldID instance that will verify the proofs
	/// @param _appId The World ID app ID
	/// @param _actionId The World ID action ID
	constructor(
		address _owner,
		IWorldID _worldId,
		string memory _appId,
		string memory _actionId,
		IAttester _attester
	) Ownable(_owner) {
		worldId = _worldId;
		attester = _attester;
		externalNullifier = abi
			.encodePacked(abi.encodePacked(_appId).hashToField(), _actionId)
			.hashToField();

		// Initialize first slot to prevent replay attack
		nullifierHashes[0] = true;

		emit ContractDeployed();
	}

	function setAttester(IAttester _attester) external onlyOwner {
		attester = _attester;
		emit AttesterUpdated(address(attester));
	}

	/// @param _signal The address of the submitter.
	/// @param _root The root of the Merkle tree.
	/// @param _nullifierHash The nullifier hash for this proof, preventing double signaling.
	/// @param _proof The zero-knowledge proof that demonstrates the claimer is registered with World ID.
	function verify(
		address _signal,
		uint256 _root,
		uint256 _nullifierHash,
		uint256[8] calldata _proof
	) external nonReentrant returns (bytes32) {
		if (address(attester) == address(0)) revert AttesterNotSet();

		// First, we make sure this person hasn't done this before
		if (nullifierHashes[_nullifierHash]) revert InvalidNullifier();

		// We now verify the provided proof is valid and the user is verified by World ID
		worldId.verifyProof(
			_root,
			groupId,
			abi.encodePacked(_signal).hashToField(),
			_nullifierHash,
			externalNullifier,
			_proof
		);

		// We now record the user has done this, so they can't do it again (proof of uniqueness)
		nullifierHashes[_nullifierHash] = true;

		emit VerificationSuccessful(_signal);

		Types.PoPSchema memory data = Types.PoPSchema({
			nullifierHash: _nullifierHash
		});

		bytes32 uid = attester.createAttestation(_signal, data);
		return uid;
	}

	function getNullifierHash(
		uint256 _nullifierHash
	) external view returns (bool) {
		return nullifierHashes[_nullifierHash];
	}
}
