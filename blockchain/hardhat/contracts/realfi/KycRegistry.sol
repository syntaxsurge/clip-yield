// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract KycRegistry is AccessControl {
    bytes32 public constant KYC_MANAGER_ROLE = keccak256("KYC_MANAGER_ROLE");

    mapping(address => bool) private verified;

    event KycStatusChanged(address indexed user, bool verified, address indexed operator);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(KYC_MANAGER_ROLE, admin);
    }

    function isVerified(address user) external view returns (bool) {
        return verified[user];
    }

    function setVerified(address user, bool isVerified) external onlyRole(KYC_MANAGER_ROLE) {
        verified[user] = isVerified;
        emit KycStatusChanged(user, isVerified, msg.sender);
    }

    function setBatchVerified(address[] calldata users, bool isVerified) external onlyRole(KYC_MANAGER_ROLE) {
        for (uint256 i = 0; i < users.length; i++) {
            verified[users[i]] = isVerified;
            emit KycStatusChanged(users[i], isVerified, msg.sender);
        }
    }
}
