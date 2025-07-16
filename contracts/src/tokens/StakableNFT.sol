// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {IStakableNFT} from "../interfaces/IStakableNFT.sol";
import {Errors} from "../libs/Errors.sol";

contract StakableNFT is ERC721, ERC721Enumerable, Ownable, IStakableNFT {
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public mintPrice = 0.01 ether;
    string private _baseTokenURI;

    mapping(uint256 => RarityTier) public tokenRarity;
    mapping(RarityTier => uint256) public rarityMultipliers;
    mapping(RarityTier => uint256) public raritySupplyLimits;
    mapping(RarityTier => uint256) public rarityMintedCount;

    constructor(string memory baseURI) ERC721("Stakable NFT", "SNFT") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _initializeRaritySystem();
    }

    function _initializeRaritySystem() private {
        rarityMultipliers[RarityTier.COMMON] = 100;
        rarityMultipliers[RarityTier.UNCOMMON] = 200;
        rarityMultipliers[RarityTier.RARE] = 300;
        rarityMultipliers[RarityTier.EPIC] = 500;
        rarityMultipliers[RarityTier.LEGENDARY] = 1000;

        raritySupplyLimits[RarityTier.COMMON] = 6000;
        raritySupplyLimits[RarityTier.UNCOMMON] = 2500;
        raritySupplyLimits[RarityTier.RARE] = 1000;
        raritySupplyLimits[RarityTier.EPIC] = 450;
        raritySupplyLimits[RarityTier.LEGENDARY] = 50;
    }

    function mint(uint256 quantity) external payable {
        if (quantity == 0 || quantity > 10) revert Errors.InvalidQuantity();
        if (_tokenIdCounter + quantity > MAX_SUPPLY) revert Errors.ExceedsNFTMaxSupply();
        if (msg.value < mintPrice * quantity) revert Errors.InsufficientPayment();

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;

            RarityTier rarity = _determineRarity(tokenId);

            if (rarityMintedCount[rarity] >= raritySupplyLimits[rarity]) {
                rarity = RarityTier.COMMON;
            }

            _safeMint(msg.sender, tokenId);
            tokenRarity[tokenId] = rarity;
            rarityMintedCount[rarity]++;

            emit NFTMinted(msg.sender, tokenId, rarity);
        }
    }

    function _determineRarity(uint256 tokenId) private view returns (RarityTier) {
        uint256 randomValue =
            uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, tokenId, msg.sender))) % 10000;

        if (randomValue < 50) return RarityTier.LEGENDARY;
        else if (randomValue < 500) return RarityTier.EPIC;
        else if (randomValue < 1500) return RarityTier.RARE;
        else if (randomValue < 4000) return RarityTier.UNCOMMON;
        else return RarityTier.COMMON;
    }

    function getTokenMultiplier(uint256 tokenId) external view returns (uint256) {
        _requireOwned(tokenId);
        return rarityMultipliers[tokenRarity[tokenId]];
    }

    function getTokenRarity(uint256 tokenId) external view returns (RarityTier) {
        _requireOwned(tokenId);
        return tokenRarity[tokenId];
    }

    function getRarityRemainingSupply(RarityTier rarity) external view returns (uint256) {
        return raritySupplyLimits[rarity] - rarityMintedCount[rarity];
    }

    function updateRarityMultiplier(RarityTier rarity, uint256 multiplier) external onlyOwner {
        if (multiplier == 0 || multiplier > 2000) revert Errors.InvalidMultiplier();
        rarityMultipliers[rarity] = multiplier;
        emit RarityMultiplierUpdated(rarity, multiplier);
    }

    function updateMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert Errors.NoFundsToWithdraw();

        (bool success,) = payable(owner()).call{value: balance}("");
        if (!success) revert Errors.WithdrawalFailed();
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Required overrides for ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
