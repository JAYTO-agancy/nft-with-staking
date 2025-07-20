// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

interface IStakableNFT is IERC721Enumerable {
    enum RarityTier {
        COMMON,
        UNCOMMON,
        RARE,
        EPIC,
        LEGENDARY
    }

    event NFTMinted(address indexed to, uint256 indexed tokenId, RarityTier rarity);
    event RarityMultiplierUpdated(RarityTier indexed rarity, uint256 multiplier);
    event CommitSubmitted(address indexed user, bytes32 commitHash, uint256 timestamp);
    event RarityRevealed(address indexed user, uint256 tokenId, RarityTier rarity, uint256 timestamp);

    function mint(uint256 quantity, bytes32 secret) external payable;
    function commitRarity(bytes32 commitHash) external;
    function revealAndMint(bytes32 secret, uint256 quantity) external payable;
    function getTokenMultiplier(uint256 tokenId) external view returns (uint256);
    function getTokenRarity(uint256 tokenId) external view returns (RarityTier);
    function getRarityRemainingSupply(RarityTier rarity) external view returns (uint256);
    function updateRarityMultiplier(RarityTier rarity, uint256 multiplier) external;
    function updateMintPrice(uint256 newPrice) external;
    function setBaseURI(string memory baseURI) external;
    function withdraw() external;
    function mintPrice() external view returns (uint256);
    function getContractOwner() external view returns (address);
}
