// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRewardToken} from "../interfaces/IRewardToken.sol";
import {Errors} from "../libs/Errors.sol";

contract RewardToken is ERC20, Ownable, IRewardToken {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;
    uint256 public totalMinted;

    constructor() ERC20("Reward Token", "RWD") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert Errors.InvalidAddress();
        if (totalMinted + amount > MAX_SUPPLY) revert Errors.ExceedsMaxSupply();

        totalMinted += amount;
        _mint(to, amount);
    }
}
