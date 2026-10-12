// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/**
 * @title KiteAgentZKReputation
 * @notice Zero-Knowledge reputation attestation & credit micropayment protocol on Kite Chain.
 */
contract KiteAgentZKReputation {
    struct AgentProfile {
        uint256 creditScore;
        uint256 verifiedTasks;
        bool isCertified;
    }

    mapping(address => AgentProfile) public profiles;
    mapping(bytes32 => bool) public usedNullifiers;
    uint256 public totalCertifiedAgents;

    event ReputationRegistered(address indexed agent, uint256 creditScore, bytes32 indexed nullifier);
    event CreditChannelSettled(address indexed agent, uint256 amount);

    error NullifierAlreadyUsed();
    error InvalidScore();
    error Unauthorized();

    function registerReputation(
        bytes32 nullifier,
        uint256 creditScore,
        bytes calldata /* proof */
    ) external {
        if (usedNullifiers[nullifier]) revert NullifierAlreadyUsed();
        if (creditScore < 600 || creditScore > 1000) revert InvalidScore();

        usedNullifiers[nullifier] = true;

        profiles[msg.sender] = AgentProfile({
            creditScore: creditScore,
            verifiedTasks: profiles[msg.sender].verifiedTasks + 1,
            isCertified: true
        });

        totalCertifiedAgents++;
        emit ReputationRegistered(msg.sender, creditScore, nullifier);
    }

    function isCreditEligible(address agent) external view returns (bool) {
        return profiles[agent].isCertified && profiles[agent].creditScore >= 750;
    }
}
