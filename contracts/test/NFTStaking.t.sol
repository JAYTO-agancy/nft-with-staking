// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test, console2} from "forge-std/Test.sol";
import {StakableNFT} from "../src/tokens/StakableNFT.sol";
import {RewardToken} from "../src/tokens/RewardToken.sol";
import {NFTStaking} from "../src/NFTStaking.sol";
import {IStakableNFT} from "../src/interfaces/IStakableNFT.sol";
import {Errors} from "../src/libs/Errors.sol";

contract NFTStakingTest is Test {
    StakableNFT public nft;
    RewardToken public rewardToken;
    NFTStaking public staking;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    function setUp() public {
        nft = new StakableNFT("ipfs://base/");
        rewardToken = new RewardToken();
        staking = new NFTStaking(address(nft), address(rewardToken));

        // Transfer ownership of reward token to staking contract
        rewardToken.transferOwnership(address(staking));

        // Give users some ETH for minting
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testMintAndStake() public {
        vm.startPrank(alice);

        // Mint NFTs
        uint256 quantity = 3;
        nft.mint{value: nft.mintPrice() * quantity}(quantity);

        // Check ownership
        assertEq(nft.balanceOf(alice), quantity);

        // Approve staking contract
        nft.setApprovalForAll(address(staking), true);

        // Stake NFTs
        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        tokenIds[2] = 3;

        staking.stake(tokenIds);

        // Verify staking
        assertEq(nft.balanceOf(address(staking)), quantity);
        assertEq(staking.getStakedTokenCount(alice), quantity);

        vm.stopPrank();
    }

    function testClaimRewards() public {
        // Setup: Alice stakes NFTs
        vm.startPrank(alice);
        nft.mint{value: nft.mintPrice() * 1}(1);
        nft.approve(address(staking), 1);

        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = 1;
        staking.stake(tokenIds);

        // Fast forward 1 day
        vm.warp(block.timestamp + 1 days);

        // Check pending rewards
        uint256 pendingRewards = staking.getPendingRewards(alice);

        // Get token multiplier
        uint256 multiplier = nft.getTokenMultiplier(1);
        uint256 expectedRewards = (10 ether * multiplier) / 100; // baseRewardRate * multiplier / precision

        assertEq(pendingRewards, expectedRewards);

        // Claim rewards
        staking.claimRewards(tokenIds);

        // Check balance
        assertEq(rewardToken.balanceOf(alice), expectedRewards);

        vm.stopPrank();
    }

    function testUnstake() public {
        // Setup: Alice stakes NFTs
        vm.startPrank(alice);
        nft.mint{value: nft.mintPrice() * 1}(1);
        nft.approve(address(staking), 1);

        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = 1;
        staking.stake(tokenIds);

        // Try to unstake immediately (should fail)
        vm.expectRevert(Errors.MinimumStakingPeriodNotMet.selector);
        staking.unstake(tokenIds);

        // Fast forward past minimum period
        vm.warp(block.timestamp + 2 hours);

        // Unstake successfully
        staking.unstake(tokenIds);

        // Verify NFT returned
        assertEq(nft.ownerOf(1), alice);
        assertEq(staking.getStakedTokenCount(alice), 0);

        vm.stopPrank();
    }

    function testRaritySystem() public {
        vm.startPrank(alice);

        // Mint multiple NFTs to test rarity distribution
        uint256 quantity = 10;
        nft.mint{value: nft.mintPrice() * quantity}(quantity);

        // Count rarities
        uint256[5] memory rarityCounts;
        for (uint256 i = 1; i <= quantity; i++) {
            IStakableNFT.RarityTier rarity = nft.getTokenRarity(i);
            rarityCounts[uint256(rarity)]++;
        }

        // Verify at least one NFT was minted
        uint256 totalMinted = 0;
        for (uint256 i = 0; i < 5; i++) {
            totalMinted += rarityCounts[i];
        }
        assertEq(totalMinted, quantity);

        vm.stopPrank();
    }

    function testPauseUnpause() public {
        // Pause contract
        staking.pause();

        // Try to stake while paused
        vm.startPrank(alice);
        nft.mint{value: nft.mintPrice() * 1}(1);
        nft.approve(address(staking), 1);

        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = 1;

        vm.expectRevert();
        staking.stake(tokenIds);

        vm.stopPrank();

        // Unpause and stake successfully
        staking.unpause();

        vm.prank(alice);
        staking.stake(tokenIds);

        assertEq(staking.getStakedTokenCount(alice), 1);
    }

    function testEmergencyWithdraw() public {
        // Setup: Alice stakes NFT
        vm.startPrank(alice);
        nft.mint{value: nft.mintPrice() * 1}(1);
        nft.approve(address(staking), 1);

        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = 1;
        staking.stake(tokenIds);
        vm.stopPrank();

        // Emergency withdraw
        staking.emergencyWithdraw(1);

        // Verify NFT returned to Alice
        assertEq(nft.ownerOf(1), alice);
        assertEq(staking.getStakedTokenCount(alice), 0);
    }

    function testFuzz_StakeMultipleTokens(uint8 quantity) public {
        quantity = uint8(bound(quantity, 1, 10));

        vm.startPrank(alice);
        nft.mint{value: nft.mintPrice() * quantity}(quantity);

        uint256[] memory tokenIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            tokenIds[i] = i + 1;
            nft.approve(address(staking), i + 1);
        }

        staking.stake(tokenIds);

        assertEq(staking.getStakedTokenCount(alice), quantity);
        vm.stopPrank();
    }
}
