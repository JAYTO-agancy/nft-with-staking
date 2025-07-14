// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IStakableNFT} from "./interfaces/IStakableNFT.sol";
import {IRewardToken} from "./interfaces/IRewardToken.sol";
import {INFTStaking} from "./interfaces/INFTStaking.sol";
import {Errors} from "./libs/Errors.sol";

contract NFTStaking is ReentrancyGuard, Ownable, Pausable, INFTStaking {
    IStakableNFT public immutable nftContract;
    IRewardToken public immutable rewardToken;

    uint256 public baseRewardRate = 10 ether;
    uint256 public constant MULTIPLIER_PRECISION = 100;
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant MIN_STAKING_PERIOD = 1 hours;
    uint256 public constant MAX_BATCH_SIZE = 50;

    mapping(uint256 => StakeInfo) public stakedNFTs;
    mapping(address => uint256[]) private userStakedTokens;
    mapping(uint256 => uint256) private stakedTokenIndex;

    uint256 public totalStakedNFTs;
    uint256 public totalRewardsDistributed;

    constructor(address _nftContract, address _rewardToken) Ownable(msg.sender) {
        if (_nftContract == address(0) || _rewardToken == address(0)) {
            revert Errors.InvalidAddress();
        }

        nftContract = IStakableNFT(_nftContract);
        rewardToken = IRewardToken(_rewardToken);
    }

    function stake(uint256[] calldata tokenIds) external nonReentrant whenNotPaused {
        if (tokenIds.length == 0) revert Errors.NoTokensProvided();
        if (tokenIds.length > MAX_BATCH_SIZE) revert Errors.TooManyTokens();

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];

            if (nftContract.ownerOf(tokenId) != msg.sender) revert Errors.NotTokenOwner();
            if (stakedNFTs[tokenId].owner != address(0)) revert Errors.TokenAlreadyStaked();

            nftContract.transferFrom(msg.sender, address(this), tokenId);

            uint256 multiplier = nftContract.getTokenMultiplier(tokenId);

            stakedNFTs[tokenId] = StakeInfo({
                owner: msg.sender,
                stakedAt: block.timestamp,
                lastClaimTime: block.timestamp,
                multiplier: multiplier
            });

            userStakedTokens[msg.sender].push(tokenId);
            stakedTokenIndex[tokenId] = userStakedTokens[msg.sender].length - 1;

            totalStakedNFTs++;

            emit NFTStaked(msg.sender, tokenId, multiplier, block.timestamp);
        }
    }

    function unstake(uint256[] calldata tokenIds) external nonReentrant {
        if (tokenIds.length == 0) revert Errors.NoTokensProvided();

        uint256 totalRewards = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            StakeInfo storage stakeInfo = stakedNFTs[tokenId];

            if (stakeInfo.owner != msg.sender) revert Errors.NotStakedByUser();

            if (block.timestamp < stakeInfo.stakedAt + MIN_STAKING_PERIOD) {
                revert Errors.MinimumStakingPeriodNotMet();
            }

            uint256 pendingRewards = _calculateTokenRewards(tokenId);
            totalRewards += pendingRewards;

            _removeFromUserStakedTokens(msg.sender, tokenId);

            delete stakedNFTs[tokenId];

            nftContract.transferFrom(address(this), msg.sender, tokenId);

            totalStakedNFTs--;

            emit NFTUnstaked(msg.sender, tokenId, pendingRewards, block.timestamp);
        }

        if (totalRewards > 0) {
            totalRewardsDistributed += totalRewards;
            rewardToken.mint(msg.sender, totalRewards);

            emit RewardsClaimed(msg.sender, totalRewards, tokenIds.length, block.timestamp);
        }
    }

    function claimRewards(uint256[] calldata tokenIds) external nonReentrant {
        if (tokenIds.length == 0) revert Errors.NoTokensProvided();

        uint256 totalRewards = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            StakeInfo storage stakeInfo = stakedNFTs[tokenId];

            if (stakeInfo.owner != msg.sender) revert Errors.NotStakedByUser();

            uint256 tokenRewards = _calculateTokenRewards(tokenId);

            if (tokenRewards > 0) {
                totalRewards += tokenRewards;
                stakeInfo.lastClaimTime = block.timestamp;
            }
        }

        if (totalRewards > 0) {
            totalRewardsDistributed += totalRewards;
            rewardToken.mint(msg.sender, totalRewards);

            emit RewardsClaimed(msg.sender, totalRewards, tokenIds.length, block.timestamp);
        }
    }

    function claimAllRewards() external nonReentrant {
        uint256[] memory stakedTokens = userStakedTokens[msg.sender];
        if (stakedTokens.length == 0) revert Errors.NoStakedTokens();

        uint256 totalRewards = 0;

        for (uint256 i = 0; i < stakedTokens.length; i++) {
            uint256 tokenId = stakedTokens[i];
            StakeInfo storage stakeInfo = stakedNFTs[tokenId];

            uint256 tokenRewards = _calculateTokenRewards(tokenId);

            if (tokenRewards > 0) {
                totalRewards += tokenRewards;
                stakeInfo.lastClaimTime = block.timestamp;
            }
        }

        if (totalRewards > 0) {
            totalRewardsDistributed += totalRewards;
            rewardToken.mint(msg.sender, totalRewards);

            emit RewardsClaimed(msg.sender, totalRewards, stakedTokens.length, block.timestamp);
        }
    }

    function _calculateTokenRewards(uint256 tokenId) internal view returns (uint256) {
        StakeInfo memory stakeInfo = stakedNFTs[tokenId];

        if (stakeInfo.owner == address(0)) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - stakeInfo.lastClaimTime;
        uint256 baseRewards = (timeElapsed * baseRewardRate) / SECONDS_PER_DAY;

        return (baseRewards * stakeInfo.multiplier) / MULTIPLIER_PRECISION;
    }

    function _removeFromUserStakedTokens(address user, uint256 tokenId) internal {
        uint256[] storage tokens = userStakedTokens[user];
        uint256 index = stakedTokenIndex[tokenId];
        uint256 lastIndex = tokens.length - 1;

        if (index != lastIndex) {
            uint256 lastTokenId = tokens[lastIndex];
            tokens[index] = lastTokenId;
            stakedTokenIndex[lastTokenId] = index;
        }

        tokens.pop();
        delete stakedTokenIndex[tokenId];
    }

    // View functions
    function getUserStakedTokens(address user) external view returns (uint256[] memory) {
        return userStakedTokens[user];
    }

    function getStakedTokenCount(address user) external view returns (uint256) {
        return userStakedTokens[user].length;
    }

    function getPendingRewards(address user) external view returns (uint256) {
        uint256[] memory stakedTokens = userStakedTokens[user];
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < stakedTokens.length; i++) {
            totalRewards += _calculateTokenRewards(stakedTokens[i]);
        }

        return totalRewards;
    }

    function getTokenPendingRewards(uint256 tokenId) external view returns (uint256) {
        return _calculateTokenRewards(tokenId);
    }

    function getStakeInfo(uint256 tokenId) external view returns (StakeInfo memory) {
        return stakedNFTs[tokenId];
    }

    function getUserStakingStats(address user)
        external
        view
        returns (uint256 stakedCount, uint256 totalPendingRewards, uint256 averageMultiplier)
    {
        uint256[] memory stakedTokens = userStakedTokens[user];
        stakedCount = stakedTokens.length;

        if (stakedCount == 0) {
            return (0, 0, 0);
        }

        uint256 totalMultiplier = 0;

        for (uint256 i = 0; i < stakedTokens.length; i++) {
            uint256 tokenId = stakedTokens[i];
            totalPendingRewards += _calculateTokenRewards(tokenId);
            totalMultiplier += stakedNFTs[tokenId].multiplier;
        }

        averageMultiplier = totalMultiplier / stakedCount;
    }

    // Admin functions
    function setBaseRewardRate(uint256 newRate) external onlyOwner {
        if (newRate == 0 || newRate > 1000 ether) revert Errors.InvalidRewardRate();

        uint256 oldRate = baseRewardRate;
        baseRewardRate = newRate;

        emit BaseRewardRateUpdated(oldRate, newRate);
    }

    function pause() external onlyOwner {
        _pause();
        emit PausedStateChanged(true);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit PausedStateChanged(false);
    }

    function emergencyWithdraw(uint256 tokenId) external onlyOwner {
        StakeInfo storage stakeInfo = stakedNFTs[tokenId];
        if (stakeInfo.owner == address(0)) revert Errors.TokenNotStaked();

        address tokenOwner = stakeInfo.owner;

        _removeFromUserStakedTokens(tokenOwner, tokenId);
        delete stakedNFTs[tokenId];

        nftContract.transferFrom(address(this), tokenOwner, tokenId);

        totalStakedNFTs--;

        emit EmergencyAction("withdraw", tokenId, tokenOwner);
    }
}
