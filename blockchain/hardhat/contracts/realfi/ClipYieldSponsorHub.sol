// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IKycRegistry {
    function isVerified(address user) external view returns (bool);
}

interface IClipYieldBoostVault {
    function asset() external view returns (address);
    function donateYield(uint256 assets) external;
}

contract ClipYieldSponsorHub {
    using SafeERC20 for IERC20;

    error InvalidAddress();
    error InvalidAmount();
    error InvalidTermsHash();
    error NotVerified(address sponsor);
    error WrongAsset(address vault, address expected, address actual);

    event ClipSponsored(
        bytes32 indexed clipHash,
        address indexed sponsor,
        address indexed vault,
        uint256 assets
    );

    event SponsoredCampaign(
        bytes32 indexed clipHash,
        address indexed sponsor,
        address indexed creator,
        address vault,
        uint256 assets,
        bytes32 termsHash
    );

    IERC20 public immutable wmnt;
    IKycRegistry public immutable kyc;

    constructor(address wmnt_, address kyc_) {
        if (wmnt_ == address(0) || kyc_ == address(0)) revert InvalidAddress();
        wmnt = IERC20(wmnt_);
        kyc = IKycRegistry(kyc_);
    }

    function sponsorClip(bytes32 clipHash, address vault, uint256 assets) external {
        _sponsor(vault, assets);
        emit ClipSponsored(clipHash, msg.sender, vault, assets);
    }

    function sponsorWithTerms(
        bytes32 clipHash,
        address creator,
        address vault,
        uint256 assets,
        bytes32 termsHash
    ) external {
        if (creator == address(0)) revert InvalidAddress();
        if (termsHash == bytes32(0)) revert InvalidTermsHash();

        _sponsor(vault, assets);
        emit SponsoredCampaign(clipHash, msg.sender, creator, vault, assets, termsHash);
    }

    function _sponsor(address vault, uint256 assets) internal {
        if (vault == address(0)) revert InvalidAddress();
        if (assets == 0) revert InvalidAmount();
        if (!kyc.isVerified(msg.sender)) revert NotVerified(msg.sender);

        address vaultAsset = IClipYieldBoostVault(vault).asset();
        if (vaultAsset != address(wmnt)) {
            revert WrongAsset(vault, address(wmnt), vaultAsset);
        }

        wmnt.safeTransferFrom(msg.sender, address(this), assets);
        wmnt.forceApprove(vault, assets);
        IClipYieldBoostVault(vault).donateYield(assets);
    }
}
