// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

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

	event ContractDeployed();

	/// @dev Emitted when a user successfully verifies their proof.
	/// @param user The address of the user who submitted the proof.
	event VerificationSuccessful(address indexed user);

	/// @dev Emitted when the attester for the contract is set or updated.
	/// @param attester The address of the attester.
	event AttesterSet(address indexed attester);

	event AttestationCreated(bytes32 uid);

	/// @dev The World ID instance that will be used for verifying proofs
	IWorldID internal immutable worldId;

	/// @dev The contract's external nullifier hash
	uint256 internal immutable externalNullifier;

	/// @dev The World ID group ID
	uint8 internal immutable groupId;

	/// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
	mapping(uint256 => bool) internal nullifierHashes;

	IAttester internal attester;

	/// @param _worldId The WorldID instance that will verify the proofs
	/// @param _appId The World ID app ID
	/// @param _actionId The World ID action ID
	constructor(
		address owner,
		IWorldID _worldId,
		string memory _appId,
		string memory _actionId
	) Ownable(owner) {
		worldId = _worldId;
		externalNullifier = abi
			.encodePacked(abi.encodePacked(_appId).hashToField(), _actionId)
			.hashToField();

		// Initialize first slot to prevent replay attack
		nullifierHashes[0] = true;
		groupId = 1; // Orb verification only

		emit ContractDeployed();
	}

	function setAttester(IAttester _attester) public onlyOwner {
		attester = _attester;
		emit AttesterSet(address(attester));
	}

	/// @param _root The root of the Merkle tree.
	/// @param _nullifierHash The nullifier hash for this proof, preventing double signaling.
	/// @param _proof The zero-knowledge proof that demonstrates the claimer is registered with World ID.
	function verify(
		uint256 _root,
		uint256 _nullifierHash,
		uint256[8] calldata _proof
	) public nonReentrant returns (bytes32) {
		require(attester != IAttester(address(0)), "Attester not set");

		// First, we make sure this person hasn't done this before
		if (nullifierHashes[_nullifierHash]) revert InvalidNullifier();

		// We now verify the provided proof is valid and the user is verified by World ID
		worldId.verifyProof(
			_root,
			groupId,
			abi.encodePacked(msg.sender).hashToField(),
			_nullifierHash,
			externalNullifier,
			_proof
		);

		// We now record the user has done this, so they can't do it again (proof of uniqueness)
		nullifierHashes[_nullifierHash] = true;

		emit VerificationSuccessful(msg.sender);

		Types.PoPSchema memory data = Types.PoPSchema({
			action: "verify",
			signal: msg.sender,
			credential_type: groupId,
			timestamp: uint64(block.timestamp)
		});

		bytes32 uid = attester.createAttestation(data);
		emit AttestationCreated(uid);

		return uid;
	}
}
