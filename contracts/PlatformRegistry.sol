//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CharityCampaign} from "./CharityCampaign.sol";
import {PlatformToken} from "./PlatformToken.sol";

/**
 * @title PlatformRegistry
 * @notice Центральный контракт-реестр для платформы "ChainImpact".
 * @dev Отвечает за верификацию организаций, создание кампаний и управление настройками платформы.
 */
contract PlatformRegistry is Ownable {
    // --- Структуры данных ---

    struct CampaignInfo {
        address campaignAddress;
        address owner;
        uint goal;
        uint deadline;
    }

    // --- Состояние контракта ---

    uint private _feePercentage;
    address public feeAddress;
    PlatformToken public immutable platformToken;
    uint public constant MAX_FEE_PERCENTAGE = 30;
    uint public constant TOKEN_REWARD_RATE = 3000000000000000 wei;

    mapping(address => bool) public verifiedOrganizations;
    mapping(address => bool) public isCampaign;
    CampaignInfo[] public allCampaigns;
    mapping(address => uint[]) public organizationCampaigns;

    // --- Ошибки ---

    error InvalidParameters();
    error OrganizationIsNotVerified();
    error InvalidFeePercentage();
    error NotACampaignContract();
    error AddressZero();
    error TransferFailed();
    error NothingToWithdraw();
    error InsufficientFundsInContract();
    error ZeroAmount();

    // --- События ---

    event OrganizationVerified(
        address indexed organizationAddress,
        bool isVerified
    );
    event CampaignCreated(
        uint indexed campaignId,
        address indexed campaignAddress,
        address indexed creator
    );
    event FeePercentageChanged(uint newFee);
    event FeeAddressChanged(address newAddress);
    event FeesWithdrawn(address indexed to, uint amount);

    // --- Модификаторы ---

    modifier onlyVerified() {
        if (!verifiedOrganizations[msg.sender])
            revert OrganizationIsNotVerified();
        _;
    }

    // --- Функции ---

    constructor(
        address initialOwner,
        uint initialFeePercentage,
        address tokenAddress
    ) Ownable(initialOwner) {
        if (initialFeePercentage > MAX_FEE_PERCENTAGE)
            revert InvalidFeePercentage();
        if (tokenAddress == address(0)) revert AddressZero();

        _feePercentage = initialFeePercentage;
        feeAddress = address(this);
        platformToken = PlatformToken(tokenAddress);
    }

    // --- Функции для владельца платформы (Admin) ---

    function verifyOrganization(
        address _organizationAddress,
        bool _isVerified
    ) external onlyOwner {
        if (_organizationAddress == address(0)) revert AddressZero();
        verifiedOrganizations[_organizationAddress] = _isVerified;
        emit OrganizationVerified(_organizationAddress, _isVerified);
    }

    function setFeePercentage(uint _newFee) external onlyOwner {
        if (_newFee > MAX_FEE_PERCENTAGE) revert InvalidFeePercentage();
        _feePercentage = _newFee;
        emit FeePercentageChanged(_newFee);
    }

    function setFeeAddress(address _newAddress) external onlyOwner {
        if (_newAddress == address(0)) revert AddressZero();
        feeAddress = _newAddress;
        emit FeeAddressChanged(_newAddress);
    }

    function withdrawFees(
        address payable _to,
        uint _amount
    ) external onlyOwner {
        if (_to == address(0)) revert AddressZero();

        uint256 balance = address(this).balance;
        if (_amount == 0) revert NothingToWithdraw();
        if (_amount > balance) revert InsufficientFundsInContract();

        (bool success, ) = _to.call{value: _amount}("");
        if (!success) revert TransferFailed();

        emit FeesWithdrawn(_to, _amount);
    }

    // --- Функции для верифицированных организаций ---

    function createCampaign(
        uint _goal,
        uint _durationInSeconds
    ) external onlyVerified returns (address) {
        if (_durationInSeconds == 0 || _goal == 0) revert InvalidParameters();

        CharityCampaign campaign = new CharityCampaign(
            msg.sender,
            _goal,
            block.timestamp + _durationInSeconds,
            address(this)
        );
        address campaignAddress = address(campaign);

        isCampaign[campaignAddress] = true;
        uint campaignId = allCampaigns.length;
        allCampaigns.push(
            CampaignInfo({
                campaignAddress: campaignAddress,
                owner: msg.sender,
                goal: _goal,
                deadline: block.timestamp + _durationInSeconds
            })
        );
        organizationCampaigns[msg.sender].push(campaignId);

        emit CampaignCreated(campaignId, campaignAddress, msg.sender);
        return campaignAddress;
    }

    // --- Внешние функции для взаимодействия с контрактами кампаний ---

    /**
     * @notice Вызывается контрактом кампании для вознаграждения донора токенами TCT.
     * @dev Только контракты, созданные этой фабрикой, могут вызывать эту функцию.
     */
    function rewardDonor(address _donor, uint _amount) external {
        if (_amount == 0) revert ZeroAmount();
        if (!isCampaign[msg.sender]) revert NotACampaignContract();
        uint256 rewardAmount = (_amount * TOKEN_REWARD_RATE) / 1 ether;
        platformToken.mint(_donor, rewardAmount);
    }

    // --- Публичные View функции ---

    function getCampaignInfo(
        uint _campaignId
    ) external view returns (CampaignInfo memory) {
        return allCampaigns[_campaignId];
    }

    function getFeePercentage() external view returns (uint) {
        return _feePercentage;
    }

    function getFeeAddress() external view returns (address) {
        return feeAddress;
    }

    /**
     * @notice Позволяет контракту принимать ETH (например, комиссии).
     */
    receive() external payable {}
}
