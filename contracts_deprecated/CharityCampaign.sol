// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CharityCampaign is ReentrancyGuard {
    address public owner;
    uint256 public goal;
    uint256 public deadline;
    uint256 public totalDonated = 0;
    bool public goalReached = false;

    address public platformRegistry;

    /// @notice donorAddress => totalDonated
    mapping(address => uint256) public donations;

    event Donated(address indexed _donor, uint256 _amount);
    event Withdrawn(uint256 _amount);
    event Refunded(address indexed _donor, uint256 _amount);

    error CampaignEnded();
    error ZeroDonation();
    error GoalNotReached();
    error NoFundsToWithdraw();
    error NotOwner();
    error TransferFailed();

    constructor(address _owner, uint256 _goal, uint256 _deadline) {
        owner = _owner;
        goal = _goal;
        deadline = _deadline;
        platformRegistry = msg.sender;
    }

    function getPlatformFeePercentage() public view returns (uint8 fee) {
        (bool success, bytes memory data) = platformRegistry.staticcall(
            abi.encodeWithSignature("getFeePercentage()")
        );
        require(success, "Call to PlatformRegistry failed");

        return abi.decode(data, (uint8));
    }

    function donate() public payable nonReentrant {
        if (block.timestamp >= deadline) revert CampaignEnded();
        if (msg.value == 0) revert ZeroDonation();

        uint amountAfterFees = (msg.value *
            (100 - getPlatformFeePercentage())) / 100;
        donations[msg.sender] += amountAfterFees;
        totalDonated += amountAfterFees;

        if (totalDonated >= goal) {
            goalReached = true;
        }

        emit Donated(msg.sender, msg.value);
    }

    function withdrawFunds() external nonReentrant {
        if (msg.sender != owner) revert NotOwner();
        if (!goalReached && (block.timestamp < deadline))
            revert GoalNotReached();
        if (totalDonated == 0) revert NoFundsToWithdraw();

        uint256 amount = totalDonated;
        totalDonated = 0;

        (bool success, ) = owner.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(amount);
    }

    function refundIfFailed() external nonReentrant {
        if (block.timestamp < deadline) revert CampaignEnded();
        if (goalReached) revert GoalNotReached();

        uint256 amount = donations[msg.sender];
        if (amount == 0) revert ZeroDonation();

        donations[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Refunded(msg.sender, amount);
    }

    function getStatus() external view returns (string memory) {
        if (block.timestamp >= deadline && !goalReached) {
            return "Failed";
        } else if (goalReached) {
            return "Success";
        } else {
            return "Active";
        }
    }

    receive() external payable {
        donate();
    }

    fallback() external payable {
        revert("Direct transfers not allowed");
    }
}
