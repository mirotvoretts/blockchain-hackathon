//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PlatformRegistry is Ownable {
    struct CampaignInfo {
        address campaignAddress;
        uint targetAmount;
        uint currentAmount;
        bool isActive;
    }

    uint8 private _feePercentage;

    /// @notice address => isFeeCollector
    mapping(address => bool) feeCollectors;
    /// @notice organizationAddress => isVerified
    mapping(address => bool) verifiedOrgranizations;
    /// @notice organizationAddress => campaigns
    mapping(address => CampaignInfo[]) organizationCampaign;

    error OrganizationIsNotVerified();
    error InvalidFeePercentage();

    event OrganizationIsVerified(
        address _organizationAddress,
        bool _isVerified
    );
    event CampaignCreated(address _campaignAddress, address _creator);

    modifier onlyVerified(address _organizationAddress) {
        require(
            verifiedOrgranizations[_organizationAddress],
            OrganizationIsNotVerified()
        );
        _;
    }

    modifier onlyFeeCollectors() {
        require(feeCollectors[msg.sender]);
        _;
    }

    constructor(
        address initialOwner,
        uint8 feePercentage
    ) Ownable(initialOwner) {
        require(
            isNewFeePercentageCorrect(feePercentage),
            InvalidFeePercentage()
        );
        _feePercentage = feePercentage;
        feeCollectors[msg.sender] = true;
    }

    function verify(
        address _organizationAddress,
        bool _isVerified
    ) external onlyOwner {
        verifiedOrgranizations[_organizationAddress] = _isVerified;
        emit OrganizationIsVerified(_organizationAddress, _isVerified);
    }

    /// @dev in future we will add more params
    /// @return address of created campaign charity
    function createCampaign(
        uint _targetAmount
    ) external onlyVerified(msg.sender) returns (address) {
        // TODO: here create CharityCampaign contract instance; replace `msg.sender` with `address(charityCampaign)`

        CampaignInfo memory info = CampaignInfo({
            campaignAddress: msg.sender,
            targetAmount: _targetAmount,
            currentAmount: 0,
            isActive: true
        });

        organizationCampaign[msg.sender].push(info);
        emit CampaignCreated(msg.sender, msg.sender); // replace only first arg with `address(charityCampaign)`

        return msg.sender;
    }

    function addFeeCollector(address _address) external onlyOwner {
        feeCollectors[_address] = true;
    }

    function setFeePercentage(uint8 _value) external onlyFeeCollectors {
        require(isNewFeePercentageCorrect(_value), InvalidFeePercentage());
        _feePercentage = _value;
    }

    function getAmountAfterFees(uint _amount) internal view returns (uint) {
        return _amount * (1 - _feePercentage / 100);
    }

    function isNewFeePercentageCorrect(
        uint _newValue
    ) private pure returns (bool) {
        return 0 <= _newValue && _newValue <= 30;
    }
}
