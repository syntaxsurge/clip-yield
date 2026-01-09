// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { ERC4626 } from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IKycRegistry {
    function isVerified(address user) external view returns (bool);
}

contract ClipYieldVault is ERC4626, AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    IKycRegistry public immutable kyc;

    event YieldDonated(address indexed donor, uint256 amount);

    error KycRequired(address user);
    error KycTransferBlocked(address from, address to);

    constructor(
        IERC20 asset_,
        IKycRegistry kyc_,
        address admin,
        string memory shareName,
        string memory shareSymbol
    ) ERC20(shareName, shareSymbol) ERC4626(asset_) {
        kyc = kyc_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
    }

    modifier onlyVerified(address user) {
        if (!kyc.isVerified(user)) revert KycRequired(user);
        _;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function deposit(uint256 assets, address receiver)
        public
        override
        whenNotPaused
        nonReentrant
        onlyVerified(msg.sender)
        onlyVerified(receiver)
        returns (uint256)
    {
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver)
        public
        override
        whenNotPaused
        nonReentrant
        onlyVerified(msg.sender)
        onlyVerified(receiver)
        returns (uint256)
    {
        return super.mint(shares, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        whenNotPaused
        nonReentrant
        onlyVerified(msg.sender)
        onlyVerified(receiver)
        onlyVerified(owner)
        returns (uint256)
    {
        return super.withdraw(assets, receiver, owner);
    }

    function redeem(uint256 shares, address receiver, address owner)
        public
        override
        whenNotPaused
        nonReentrant
        onlyVerified(msg.sender)
        onlyVerified(receiver)
        onlyVerified(owner)
        returns (uint256)
    {
        return super.redeem(shares, receiver, owner);
    }

    function donateYield(uint256 amount)
        external
        whenNotPaused
        nonReentrant
        onlyRole(MANAGER_ROLE)
    {
        IERC20(asset()).safeTransferFrom(msg.sender, address(this), amount);
        emit YieldDonated(msg.sender, amount);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20) {
        if (from != address(0) && to != address(0)) {
            if (!kyc.isVerified(from) || !kyc.isVerified(to)) {
                revert KycTransferBlocked(from, to);
            }
        }
        super._update(from, to, value);
    }
}
