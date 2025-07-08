//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DonationPool is Ownable {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint targetAmount;
        uint currentAmount;
        bool isActive;
        bool isVerified;
    }

    struct Donation {
        address donor;
        uint amount;
        uint fee;
        uint timestamp;
    }

    /// @notice campaignId => donations
    mapping(uint => Donation[]) public donations;
    /// @notice campaignId => campaign
    mapping(uint => Campaign) public campaigns;
    uint public campaignsCount = 0;

    event Donated(uint _campaignId, address _donor);
    event WithdrawFunds(uint _campaignId, address _recipient);

    error CampaignIsNotActive();
    error NotACampaignOwner();
    error ZeroCampaignBalance();
    error ZeroContractBalance();

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier onlyCampaignOwner(uint _campaignId) {
        require(
            campaigns[_campaignId].owner == msg.sender,
            NotACampaignOwner()
        );
        _;
    }

    /// @dev _fee - expecting a percentage fee
    /// @notice I want to give users the ability to specify a donation fee from 0 to 25 percent (for example) so that we can make money too
    function donate(uint _campaignId, uint _fee) external payable {
        require(campaigns[_campaignId].isActive, CampaignIsNotActive());
        Campaign storage campaign = campaigns[_campaignId];
        uint donationAmount = msg.value * (1 - _fee / 100);
        campaign.currentAmount += donationAmount;
        donations[_campaignId].push(
            Donation(msg.sender, donationAmount, _fee, block.timestamp)
        );
        emit Donated(_campaignId, msg.sender);
    }

    function withdrawFunds(
        uint _campaignId,
        address payable _recipient
    ) external onlyCampaignOwner(_campaignId) {
        require(
            campaigns[_campaignId].currentAmount > 0,
            ZeroCampaignBalance()
        );
        uint amount = campaigns[_campaignId].currentAmount;
        campaigns[_campaignId].currentAmount = 0;
        _recipient.transfer(amount);
        emit WithdrawFunds(_campaignId, _recipient);
    }

    function withdraw() external payable onlyOwner {
        uint contractBalance = address(this).balance;
        require(contractBalance > 0, ZeroContractBalance());
        address owner = owner();
        payable(owner).transfer(contractBalance);
    }
}
