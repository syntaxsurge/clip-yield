// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

interface IKycRegistry {
    function isVerified(address wallet) external view returns (bool);
}

contract ClipYieldInvoiceReceipts is ERC721, Ownable {
    IKycRegistry public immutable kyc;

    address public minter;
    uint256 public nextTokenId = 1;

    struct Receipt {
        bytes32 campaignId;
        bytes32 termsHash;
        bytes32 postIdHash;
        address sponsor;
        address creator;
        address boostVault;
        uint256 sponsorAmount;
        uint256 protocolFee;
        uint64 createdAt;
    }

    mapping(uint256 => Receipt) public receipts;

    error InvalidAddress();
    error NotMinter();
    error NotVerified(address wallet);
    error InvalidRecipient();

    constructor(address kycRegistry, address owner)
        ERC721("ClipYield Invoice Receipt", "CYINVOICE")
        Ownable(owner)
    {
        if (kycRegistry == address(0) || owner == address(0)) revert InvalidAddress();
        kyc = IKycRegistry(kycRegistry);
    }

    function setMinter(address newMinter) external onlyOwner {
        if (newMinter == address(0)) revert InvalidAddress();
        minter = newMinter;
    }

    function mintReceipt(address to, Receipt calldata receipt)
        external
        returns (uint256 tokenId)
    {
        if (msg.sender != minter) revert NotMinter();
        if (to == address(0)) revert InvalidAddress();
        if (to != receipt.sponsor) revert InvalidRecipient();
        if (!kyc.isVerified(to)) revert NotVerified(to);
        if (!kyc.isVerified(receipt.creator)) revert NotVerified(receipt.creator);

        tokenId = nextTokenId++;
        receipts[tokenId] = receipt;
        _safeMint(to, tokenId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address from)
    {
        from = super._update(to, tokenId, auth);

        if (from != address(0) && to != address(0)) {
            if (!kyc.isVerified(from)) revert NotVerified(from);
            if (!kyc.isVerified(to)) revert NotVerified(to);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        Receipt memory receipt = receipts[tokenId];

        string memory json = string.concat(
            '{"name":"ClipYield Invoice Receipt #',
            Strings.toString(tokenId),
            '","description":"Tokenized sponsorship invoice receipt for ClipYield.",',
            '"attributes":[',
            '{"trait_type":"Campaign ID","value":"',
            _toHex(receipt.campaignId),
            '"},',
            '{"trait_type":"Post","value":"',
            _toHex(receipt.postIdHash),
            '"},',
            '{"trait_type":"Terms Hash","value":"',
            _toHex(receipt.termsHash),
            '"},',
            '{"trait_type":"Sponsor","value":"',
            _toHexAddress(receipt.sponsor),
            '"},',
            '{"trait_type":"Creator","value":"',
            _toHexAddress(receipt.creator),
            '"},',
            '{"trait_type":"Boost Vault","value":"',
            _toHexAddress(receipt.boostVault),
            '"},',
            '{"display_type":"number","trait_type":"Sponsor Amount (wei)","value":',
            Strings.toString(receipt.sponsorAmount),
            '},',
            '{"display_type":"number","trait_type":"Protocol Fee (wei)","value":',
            Strings.toString(receipt.protocolFee),
            '},',
            '{"display_type":"date","trait_type":"Created At","value":',
            Strings.toString(uint256(receipt.createdAt)),
            '}]}'
        );

        return string.concat(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        );
    }

    function _toHex(bytes32 value) internal pure returns (string memory) {
        return Strings.toHexString(uint256(value), 32);
    }

    function _toHexAddress(address value) internal pure returns (string memory) {
        return Strings.toHexString(uint160(value), 20);
    }
}
