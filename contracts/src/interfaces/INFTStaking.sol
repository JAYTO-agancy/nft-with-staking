// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface INFTStaking {
    struct StakeInfo {
        address owner;
        uint256 stakedAt;
        uint256 lastClaimTime;
        uint256 multiplier;
    }

    event NFTStaked(address indexed user, uint256 indexed tokenId, uint256 multiplier, uint256 timestamp);
    event NFTUnstaked(address indexed user, uint256 indexed tokenId, uint256 rewards, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 totalRewards, uint256 tokenCount, uint256 timestamp);
    event BaseRewardRateUpdated(uint256 oldRate, uint256 newRate);
    event EmergencyAction(string action, uint256 tokenId, address user);
    event PausedStateChanged(bool isPaused);

    function stake(uint256[] calldata tokenIds) external;
    function unstake(uint256[] calldata tokenIds) external;
    function claimRewards(uint256[] calldata tokenIds) external;
    function claimAllRewards() external;
    function getUserStakedTokens(address user) external view returns (uint256[] memory);
    function getStakedTokenCount(address user) external view returns (uint256);
    function getPendingRewards(address user) external view returns (uint256);
    function getTokenPendingRewards(uint256 tokenId) external view returns (uint256);
    function getStakeInfo(uint256 tokenId) external view returns (StakeInfo memory);
}
