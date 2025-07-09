//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CharityCampaign} from "./CharityCampaign.sol";
import {PlatformToken} from "./PlatformToken.sol";

/**
 * @title PlatformRegistry
 * @notice Центральный контракт-реестр для платформы "Прозрачная Благотворительность".
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

    uint8 private _feePercentage;
    address public feeAddress;
    PlatformToken public immutable platformToken;
    uint256 public constant TOKEN_REWARD_RATE = 0.003 ether; // надо подумать какая выгодна будет :)

    mapping(address => bool) public verifiedOrganizations;
    mapping(address => bool) public isCampaign; 
    CampaignInfo[] public allCampaigns;
    mapping(address => uint[]) public organizationCampaigns; 

    // --- Ошибки ---
    
    error OrganizationIsNotVerified();
    error InvalidFeePercentage();
    error NotACampaignContract();
    error AddressZero();
    error TransferFailed();
    error NothingToWithdraw();
    error InsufficientFundsInContract();


    // --- События ---

    event OrganizationVerified(address indexed organizationAddress, bool isVerified);
    event CampaignCreated(uint indexed campaignId, address indexed campaignAddress, address indexed creator);
    event FeePercentageChanged(uint8 newFee);
    event FeeAddressChanged(address newAddress);
    event FeesWithdrawn(address indexed to, uint256 amount);


    // --- Модификаторы ---

    modifier onlyVerified() {
        if (!verifiedOrganizations[msg.sender]) revert OrganizationIsNotVerified();
        _;
    }

    // --- Функции ---

    constructor(address initialOwner, uint8 initialFeePercentage, address _tokenAddress) Ownable(initialOwner) {
        if (initialFeePercentage > 30) revert InvalidFeePercentage(); 
        if (_tokenAddress == address(0)) revert AddressZero();
        
        _feePercentage = initialFeePercentage;
        feeAddress = address(this); 
        platformToken = PlatformToken(_tokenAddress);
    }
    
    // --- Функции для владельца платформы (Admin) ---

    function verifyOrganization(address _organizationAddress, bool _isVerified) external onlyOwner {
        if (_organizationAddress == address(0)) revert AddressZero();
        verifiedOrganizations[_organizationAddress] = _isVerified;
        emit OrganizationVerified(_organizationAddress, _isVerified);
    }

    function setFeePercentage(uint8 _newFee) external onlyOwner {
        if (_newFee > 30) revert InvalidFeePercentage();
        _feePercentage = _newFee;
        emit FeePercentageChanged(_newFee);
    }

    function setFeeAddress(address _newAddress) external onlyOwner {
        if (_newAddress == address(0)) revert AddressZero();
        feeAddress = _newAddress;
        emit FeeAddressChanged(_newAddress);
    }

    function withdrawFees(address payable _to, uint256 _amount) external onlyOwner {
        if (_to == address(0)) revert AddressZero();
        
        uint256 balance = address(this).balance;
        if (_amount == 0) revert NothingToWithdraw();
        if (_amount > balance) revert InsufficientFundsInContract();

        (bool success, ) = _to.call{value: _amount}("");
        if (!success) revert TransferFailed();

        emit FeesWithdrawn(_to, _amount);
    }

    // --- Функции для верифицированных организаций ---

    function createCampaign(uint _goal, uint _durationInSeconds) external onlyVerified returns (address) {
        CharityCampaign campaign = new CharityCampaign(msg.sender, _goal, _durationInSeconds, address(this));
        address campaignAddress = address(campaign);

        isCampaign[campaignAddress] = true;
        uint campaignId = allCampaigns.length;
        allCampaigns.push(CampaignInfo({
            campaignAddress: campaignAddress,
            owner: msg.sender,
            goal: _goal,
            deadline: block.timestamp + _durationInSeconds
        }));
        organizationCampaigns[msg.sender].push(campaignId);

        emit CampaignCreated(campaignId, campaignAddress, msg.sender);
        return campaignAddress;
    }

    // --- Внешние функции для взаимодействия с контрактами кампаний ---
    
    /**
     * @notice Вызывается контрактом кампании для вознаграждения донора токенами TCT.
     * @dev Только контракты, созданные этой фабрикой, могут вызывать эту функцию.
     */
    function rewardDonor(address _donor, uint256 _amount) external {
        if (!isCampaign[msg.sender]) revert NotACampaignContract();
        uint256 rewardAmount = (_amount * TOKEN_REWARD_RATE) / 1 ether;
        platformToken.mint(_donor, rewardAmount);
    }

    // --- Публичные View функции ---

    function getCampaignInfo(uint _campaignId) external view returns (CampaignInfo memory) {
        return allCampaigns[_campaignId];
    }
    
    function getFeePercentage() external view returns (uint8) {
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