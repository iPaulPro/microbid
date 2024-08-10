export const popVerifierAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "contract IWorldID",
        "name": "_worldId",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_appId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_actionId",
        "type": "string"
      },
      {
        "internalType": "contract IAttester",
        "name": "_attester",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AttesterNotSet",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidNullifier",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "attester",
        "type": "address"
      }
    ],
    "name": "AttesterUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "ContractDeployed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "VerificationSuccessful",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "attester",
    "outputs": [
      {
        "internalType": "contract IAttester",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_nullifierHash",
        "type": "uint256"
      }
    ],
    "name": "getNullifierHash",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IAttester",
        "name": "_attester",
        "type": "address"
      }
    ],
    "name": "setAttester",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_signal",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_root",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_nullifierHash",
        "type": "uint256"
      },
      {
        "internalType": "uint256[8]",
        "name": "_proof",
        "type": "uint256[8]"
      }
    ],
    "name": "verify",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;