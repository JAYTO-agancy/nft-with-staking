// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library Errors {
    // RewardToken errors
    error ExceedsMaxSupply();
    error InvalidAddress();

    // StakableNFT errors
    error InvalidQuantity();
    error ExceedsNFTMaxSupply();
    error InsufficientPayment();
    error TokenDoesNotExist();
    error InvalidMultiplier();
    error NoFundsToWithdraw();
    error WithdrawalFailed();

    // NFTStaking errors
    error NoTokensProvided();
    error TooManyTokens();
    error NotTokenOwner();
    error TokenAlreadyStaked();
    error NotStakedByUser();
    error MinimumStakingPeriodNotMet();
    error NoStakedTokens();
    error TokenNotStaked();
    error ContractPaused();
    error InvalidRewardRate();

    // Commit-reveal errors
    error CommitAlreadyExists();
    error InvalidCommit();
    error CommitTooEarly();
    error CommitExpired();
}
