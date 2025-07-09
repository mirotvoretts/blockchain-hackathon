//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CharityCampaign} from "./CharityCampaign.sol";

contract PlatformRegistry is Ownable {
    struct CampaignInfo {
        address campaignAddress;
        uint256 goal;
        uint256 totalDonated;
        bool isActive;
    }

    uint8 private _feePercentage;

    /// @notice address => isFeeCollector
    mapping(address => bool) public feeCollectors;
    /// @notice organizationAddress => isVerified
    mapping(address => bool) public verifiedOrganizations;
    /// @notice organizationAddress => campaigns
    mapping(address => CampaignInfo[]) public organizationCampaign;

    error OrganizationIsNotVerified();
    error InvalidFeePercentage();

    event OrganizationIsVerified(
        address indexed _organizationAddress,
        bool _isVerified
    );
    event CampaignCreated(
        address indexed _campaignAddress,
        address indexed _creator
    );

    modifier onlyVerified(address _organizationAddress) {
        require(
            verifiedOrganizations[_organizationAddress],
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
        verifiedOrganizations[msg.sender] = true;
    }

    function verify(
        address _organizationAddress,
        bool _isVerified
    ) external onlyOwner {
        verifiedOrganizations[_organizationAddress] = _isVerified;
        emit OrganizationIsVerified(_organizationAddress, _isVerified);
    }

    /// @return address of created campaign charity
    function createCampaign(
        uint256 _goal,
        uint256 _deadline
    ) external onlyVerified(msg.sender) returns (address) {
        CharityCampaign campaign = new CharityCampaign(
            msg.sender,
            _goal,
            _deadline + block.timestamp
        );
        address campaignAddress = address(campaign);

        CampaignInfo memory info = CampaignInfo({
            campaignAddress: campaignAddress,
            goal: _goal,
            totalDonated: 0,
            isActive: true
        });

        emit CampaignCreated(campaignAddress, msg.sender);
        organizationCampaign[msg.sender].push(info);

        return campaignAddress;
    }

    function addFeeCollector(address _address) external onlyOwner {
        feeCollectors[_address] = true;
    }

    function setFeePercentage(uint8 _value) external onlyFeeCollectors {
        require(isNewFeePercentageCorrect(_value), InvalidFeePercentage());
        _feePercentage = _value;
    }

    function getFeePercentage() public view returns (uint8) {
        return _feePercentage;
    }

    function isNewFeePercentageCorrect(
        uint256 _newValue
    ) private pure returns (bool) {
        return 0 <= _newValue && _newValue <= 30;
    }
}
