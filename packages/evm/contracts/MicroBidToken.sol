// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import {IBidToken} from "./interfaces/IBidToken.sol";

contract MicroBidToken is ERC20, ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint8 private constant _decimals = 0;

    error DecimalsNotSupported();

    modifier onlyZeroDecimals(uint256 amount) {
        if (amount % 1 > 0) {
            revert DecimalsNotSupported();
        }
        _;
    }

    constructor(
        address minter,
        address burner
    ) ERC20("MicroBidToken", "MBT") ERC20Permit("MicroBidToken") {
        _grantRole(MINTER_ROLE, minter);
        _grantRole(BURNER_ROLE, burner);
    }

    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    function mint(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) onlyZeroDecimals(amount) {
        _mint(to, amount);
    }

    function burn(
        address from,
        uint256 amount
    ) external onlyRole(BURNER_ROLE) onlyZeroDecimals(amount) {
        _burn(from, amount);
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public virtual override onlyZeroDecimals(amount) returns (bool) {
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override onlyZeroDecimals(amount) returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }
}
