// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IEAS, Attestation, AttestationRequest, AttestationRequestData } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { NO_EXPIRATION_TIME, EMPTY_UID } from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

import { IAttester } from "./interfaces/IAttester.sol";
import { Types } from "./constants/Types.sol";

contract MicroBidAttester is IAttester, Ownable {
	event MessageReceived(
		uint16 srcChainId,
		bytes srcAddress,
		uint64 nonce,
		bytes payload
	);

	event AttestationCreated(
		bytes32 uid,
		bytes32 schema,
		bytes data,
		address attester
	);

	/// @dev Emitted when the verifier for the contract is set or updated.
	/// @param verifier The address of the verifier.
	event VerifierUpdated(address indexed verifier);

	IEAS internal immutable eas;

	bytes32 internal schema;

	address internal verifier;

	mapping(address => bytes32) internal attestations;

	/**
	 * @param owner The owner of the contract
	 * @param _eas The Ethereum Attestation Service instance
	 * @param _schema The schema of the attestation
	 */
	constructor(
		address owner,
		IEAS _eas,
		bytes32 _schema,
		address _verifier
	) Ownable(owner) {
		eas = _eas;
		schema = _schema;
		verifier = _verifier;
	}

	function setVerifier(address _verifier) public onlyOwner {
		verifier = _verifier;
		emit VerifierUpdated(verifier);
	}

	function isVerified(address _address) public view returns (bool) {
		bytes32 uid = attestations[_address];
		if (uid == 0) {
			return false;
		}

		// Ensure the attestation is from this contract
		Attestation memory attestation = eas.getAttestation(uid);
		return
			attestation.attester == address(this) &&
			attestation.recipient == _address;
	}

	function getAttestation(
		address _address
	) public view returns (Attestation memory) {
		bytes32 uid = attestations[_address];
		return eas.getAttestation(uid);
	}

	function createAttestation(
		address recipient,
		Types.PoPSchema memory data
	) public returns (bytes32) {
		require(msg.sender == verifier, "Unauthorized verifier");

		bytes memory encodedData = abi.encode(data);

		AttestationRequest memory request = AttestationRequest({
			schema: schema,
			data: AttestationRequestData({
				data: encodedData,
				recipient: recipient,
				expirationTime: NO_EXPIRATION_TIME, // No expiration time
				revocable: false,
				refUID: EMPTY_UID, // No references UI
				value: 0 // No value/ETH
			})
		});

		bytes32 uid = eas.attest(request);
		attestations[recipient] = uid;
		emit AttestationCreated(uid, schema, encodedData, recipient);

		return uid;
	}
}
