// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

interface IKycRegistry {
    function isVerified(address user) external view returns (bool);
}

contract ClipYieldBoostPass is ERC1155, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    IKycRegistry public immutable kyc;
    uint256 public currentEpoch;

    mapping(uint256 => mapping(address => bool)) public eligible;
    mapping(uint256 => mapping(address => bool)) public claimed;

    error Soulbound();
    error NotEligible();
    error AlreadyClaimed();
    error NotKycVerified();
    error InvalidEpoch();

    event EpochPublished(uint256 indexed epoch, uint256 walletCount);
    event Claimed(uint256 indexed epoch, address indexed wallet);

    constructor(address kycRegistry, string memory baseUri, address admin)
        ERC1155(baseUri)
    {
        kyc = IKycRegistry(kycRegistry);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
    }

    function publishEpoch(uint256 epoch, address[] calldata wallets)
        external
        onlyRole(MANAGER_ROLE)
    {
        if (epoch <= currentEpoch) revert InvalidEpoch();

        currentEpoch = epoch;

        for (uint256 i = 0; i < wallets.length; i++) {
            eligible[epoch][wallets[i]] = true;
        }

        emit EpochPublished(epoch, wallets.length);
    }

    function claim(uint256 epoch) external {
        if (!eligible[epoch][msg.sender]) revert NotEligible();
        if (claimed[epoch][msg.sender]) revert AlreadyClaimed();
        if (!kyc.isVerified(msg.sender)) revert NotKycVerified();

        claimed[epoch][msg.sender] = true;
        _mint(msg.sender, epoch, 1, "");

        emit Claimed(epoch, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        if (from != address(0) && to != address(0)) revert Soulbound();
        super._update(from, to, ids, values);
    }
}
