# Microbid

Microbid is a platform for provably fair, fully onchain, penny auctions. The platform allows for auctioning real world assets as well as digital assets, like NFTs.

Users must create a Proof of Personhood with Worldcoin World ID in order to bid on auctions. Each bid costs $0.10 and can be bought with USDC. When a bid is placed, the price of the auction increases by $0.01 and if placed within the last ~20 seconds more time is added to the auction. When the timer runs out, the last bidder can then purchase the item at the final cost.

Alchemy Account Kit is used to create Smart Accounts, allowing users to sign up with just an email address. All transactions are sponsored, allowing for signless bidding and usage.

The main issue with existing (off-chain) penny auction sites is the lack of credibility and transparency. In Microbid you can be certain that every bid placed is by a real person, and all transactions are onchain and independently verifiable.

## How it's made

This project uses multiple smart contracts deployed to Base L2. World ID is used to create a Proof of Personhood. Once the proof is verified onchain, an attestation is created on the Ethereum Attestation Service. This allows for quick verified bidding without the need to create further proofs. Alchemy Account Kit is used extensively to enable Smart Accounts, requiring only an email address to sign up. All transactions performed by the embedded accounts are sponsored, allowing for signless bidding and usage.

## Contracts

Microbid is currently deployed on Base L2 tesnet, Base Sepolia. The contracts are as follows:

| Contract         | Purpose                                                           | Address                                                                                                                       |
|------------------|-------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| MicroBidToken    | The token used to place bets on auctions.                         | [0x077afD867F1F6144677F39416797D64d743db31D](https://sepolia.basescan.org/address/0x6c11ebe9cdeea9c0c41c51e144a9c47e1ecf66da) |
| MicroBidVerifier | Verifies Proof of Personhood using World ID.                      | [0xA1b5884235Fe70a512bAbbf94BAaa39aC10CCC1f](https://sepolia.basescan.org/address/0xA1b5884235Fe70a512bAbbf94BAaa39aC10CCC1f) |
| MicroBidAttester | Creates and validates Proof of Personhood attestations using EAS. | [0xF425aA733164f7f0243A394aa58aa03E4229ABFb](https://sepolia.basescan.org/address/0xF425aA733164f7f0243A394aa58aa03E4229ABFb) |
| MicroBidTreasury | Manages minting and burning of bid tokens.                        | [0x161b278191a3e00660645fb3dFa7066c900092Ed](https://sepolia.basescan.org/address/0x161b278191a3e00660645fb3dFa7066c900092Ed) |
| MicroBidAuction  | The main contract that controls auctions.                         | [0x6C11EBE9CDEEA9c0C41c51e144a9C47e1eCF66Da](https://sepolia.basescan.org/address/0x6C11EBE9CDEEA9c0C41c51e144a9C47e1eCF66Da) |

## Technical details

The project is built using Solidity, Hardhat, and Alchemy. The frontend is built using React, Next.js, and Tailwind CSS. The contracts are deployed to Base Sepolia, a L2 testnet. Onchain verification is done using World ID and verified with each transaction using Ethereum Attestation Service.

## Flow

The flow of the project is as follows:

1. Auction is create on Base Sepolia by the seller.
2. User signs up with email via Alchemy Account Kit; a Smart Account is created and used for bidding.
3. User creates a Proof of Personhood with Worldcoin World ID.
4. Proof is verified onchain and an attestation is created.
5. Verified users are able to buy bid tokens with $USDC.
6. User bids on an auction using MicroBidToken ($MBT).
7. User wins the auction and purchases the item using $USDC.

## More details and demo

https://ethglobal.com/showcase/microbid-dqs54