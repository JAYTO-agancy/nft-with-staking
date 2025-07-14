// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {StakableNFT} from "../src/tokens/StakableNFT.sol";
import {RewardToken} from "../src/tokens/RewardToken.sol";
import {NFTStaking} from "../src/NFTStaking.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy NFT contract
        StakableNFT nft = new StakableNFT("ipfs://QmYourIPFSHash/");

        // Deploy Reward Token
        RewardToken rewardToken = new RewardToken();

        // Deploy Staking Contract
        NFTStaking staking = new NFTStaking(address(nft), address(rewardToken));

        // Transfer ownership of reward token to staking contract
        rewardToken.transferOwnership(address(staking));

        vm.stopBroadcast();
    }
}
