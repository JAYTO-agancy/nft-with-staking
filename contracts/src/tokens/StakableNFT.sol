// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {IStakableNFT} from "../interfaces/IStakableNFT.sol";
import {Errors} from "../libs/Errors.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract StakableNFT is ERC721, ERC721Enumerable, Ownable, IStakableNFT {
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public mintPrice = 0.01 ether;
    string private _baseTokenURI;

    mapping(uint256 => RarityTier) public tokenRarity;
    mapping(RarityTier => uint256) public rarityMultipliers;
    mapping(RarityTier => uint256) public raritySupplyLimits;
    mapping(RarityTier => uint256) public rarityMintedCount;

    // Commit-reveal scheme
    mapping(address => bytes32) public commits;
    mapping(address => uint256) public commitTimestamps;
    uint256 public constant COMMIT_DELAY = 1 hours;
    uint256 public constant COMMIT_EXPIRY = 24 hours;

    constructor(string memory baseURI) ERC721("Plumffel NFT", "PlumffelNFT") Ownable(msg.sender) {
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

    /**
     * @dev Mint with commit-reveal scheme for secure rarity determination
     * @param quantity Number of NFTs to mint
     * @param secret Secret value for rarity determination
     */
    function mint(uint256 quantity, bytes32 secret) external payable {
        if (quantity == 0 || quantity > 10) revert Errors.InvalidQuantity();
        if (_tokenIdCounter + quantity > MAX_SUPPLY) revert Errors.ExceedsNFTMaxSupply();
        if (msg.value < mintPrice * quantity) revert Errors.InsufficientPayment();

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;

            // Determine rarity based on secret value
            RarityTier rarity = _determineRarityFromSecret(secret, tokenId);

            // Check limits and find available rarity
            rarity = _findAvailableRarity(rarity);

            _safeMint(msg.sender, tokenId);
            tokenRarity[tokenId] = rarity;
            rarityMintedCount[rarity]++;

            emit NFTMinted(msg.sender, tokenId, rarity);
        }
    }

    /**
     * @dev User submits hash of secret value
     * @param commitHash Hash of (secret + userAddress)
     */
    function commitRarity(bytes32 commitHash) external {
        if (commits[msg.sender] != bytes32(0)) {
            revert Errors.CommitAlreadyExists();
        }

        commits[msg.sender] = commitHash;
        commitTimestamps[msg.sender] = block.timestamp;

        emit CommitSubmitted(msg.sender, commitHash, block.timestamp);
    }

    /**
     * @dev Reveal secret value and mint
     * @param secret Secret value
     * @param quantity Number of NFTs to mint
     */
    function revealAndMint(bytes32 secret, uint256 quantity) external payable {
        bytes32 expectedCommit = keccak256(abi.encodePacked(secret, msg.sender));

        if (commits[msg.sender] != expectedCommit) {
            revert Errors.InvalidCommit();
        }

        if (block.timestamp < commitTimestamps[msg.sender] + COMMIT_DELAY) {
            revert Errors.CommitTooEarly();
        }

        if (block.timestamp > commitTimestamps[msg.sender] + COMMIT_EXPIRY) {
            revert Errors.CommitExpired();
        }

        // Clear commit
        delete commits[msg.sender];
        delete commitTimestamps[msg.sender];

        // Mint NFTs
        if (quantity == 0 || quantity > 10) revert Errors.InvalidQuantity();
        if (_tokenIdCounter + quantity > MAX_SUPPLY) revert Errors.ExceedsNFTMaxSupply();
        if (msg.value < mintPrice * quantity) revert Errors.InsufficientPayment();

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;

            RarityTier rarity = _determineRarityFromSecret(secret, tokenId);
            rarity = _findAvailableRarity(rarity);

            _safeMint(msg.sender, tokenId);
            tokenRarity[tokenId] = rarity;
            rarityMintedCount[rarity]++;

            emit NFTMinted(msg.sender, tokenId, rarity);
            emit RarityRevealed(msg.sender, tokenId, rarity, block.timestamp);
        }
    }

    function _findAvailableRarity(RarityTier preferredRarity) private view returns (RarityTier) {
        // Сначала пробуем желаемую редкость
        if (rarityMintedCount[preferredRarity] < raritySupplyLimits[preferredRarity]) {
            return preferredRarity;
        }
        // Если лимит исчерпан, ищем менее редкую (enum с меньшим значением)
        // Например, если preferredRarity = RARE (2), то пробуем UNCOMMON (1), потом COMMON (0)
        for (uint256 i = uint256(preferredRarity); i > 0; i--) {
            RarityTier lessRare = RarityTier(i - 1);
            if (rarityMintedCount[lessRare] < raritySupplyLimits[lessRare]) {
                return lessRare;
            }
        }
        // Если ничего не найдено, revert
        revert Errors.ExceedsNFTMaxSupply(); // Все лимиты исчерпаны
    }

    function _determineRarityFromSecret(bytes32 secret, uint256 tokenId) private pure returns (RarityTier) {
        uint256 randomValue = uint256(keccak256(abi.encodePacked(secret, tokenId))) % 10000;

        if (randomValue < 50) return RarityTier.LEGENDARY; // 0.5%

        else if (randomValue < 500) return RarityTier.EPIC; // 4.5%

        else if (randomValue < 1500) return RarityTier.RARE; // 10%

        else if (randomValue < 4000) return RarityTier.UNCOMMON; // 25%

        else return RarityTier.COMMON; // 60%
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

    function getContractOwner() external view returns (address) {
        return owner();
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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string.concat(baseURI, Strings.toString(tokenId), ".json") : "";
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
