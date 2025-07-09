// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IPlatformRegistry
 * @notice Интерфейс для взаимодействия с главным контрактом платформы.
 * @dev Позволяет контракту кампании получать информацию о комиссиях и вознаграждать доноров.
 */
interface IPlatformRegistry {
    function getFeePercentage() external view returns (uint8);
    function getFeeAddress() external view returns (address);
    function rewardDonor(address donor, uint256 amount) external;
}

/**
 * @title CharityCampaign
 * @notice Контракт для одной благотворительной кампании с прозрачным расходованием средств.
 * @dev Реализует логику сбора, голосования доноров за расходы и исполнения запросов.
 */
contract CharityCampaign is ReentrancyGuard {
    // --- Состояние контракта ---

    address public immutable owner; // Адрес организации-создателя
    IPlatformRegistry public immutable platformRegistry; // Адрес главного контракта-реестра

    uint256 public immutable goal; // Целевая сумма сбора (в WEI)
    uint256 public immutable deadline; // Время окончания кампании (timestamp)
    
    uint256 public totalDonated = 0; // Всего собрано (за вычетом комиссии)
    uint256 public totalSpent = 0; // Всего потрачено через одобренные запросы
    
    // --- Структуры данных ---

    /// @notice Запрос на расходование средств, создаваемый организацией.
    struct SpendingRequest {
        string description;       // Описание: на что тратятся деньги
        uint256 amount;           // Сумма запроса
        address payable recipient;// Адрес получателя средств (например, поставщика)
        bool executed;            // Исполнен ли запрос
        uint256 approvalVotes;    // "Вес" голосов "за" (сумма донатов проголосовавших)
        mapping(address => bool) voters; // Кто уже проголосовал
    }

    uint256 public nextRequestId;
    mapping(uint256 => SpendingRequest) public spendingRequests;
    mapping(address => uint256) public donations; 

    // --- События ---

    event Donated(address indexed donor, uint256 amount, uint256 fee);
    event RequestCreated(uint256 indexed requestId, string description, uint256 amount, address indexed recipient);
    event RequestVoted(uint256 indexed requestId, address indexed voter, uint256 voteWeight);
    event RequestExecuted(uint256 indexed requestId, uint256 amount);
    event Refunded(address indexed donor, uint256 amount);

    // --- Ошибки ---

    error CampaignHasEnded();
    error CampaignIsActive();
    error CampaignNotSuccessful();
    error GoalAlreadyReached();
    error ZeroDonation();
    error NotOwner();
    error TransferFailed();
    error GoalNotReached();
    error NothingToRefund();
    error AlreadyVoted();
    error RequestDoesNotExist();
    error RequestAlreadyExecuted();
    error InsufficientApprovals(uint256 required, uint256 actual);
    error NotADonor();
    error InsufficientFundsInContract();
    error AddressZero();

    // --- Модификаторы ---

    modifier onlyCampaignOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyDonors() {
        if (donations[msg.sender] == 0) revert NotADonor();
        _;
    }

    // --- Функции ---

    constructor(address _owner, uint256 _goal, uint256 _durationInSeconds, address _platformRegistry) {
        if (_owner == address(0) || _platformRegistry == address(0)) revert AddressZero();
        owner = _owner;
        goal = _goal;
        deadline = block.timestamp + _durationInSeconds;
        platformRegistry = IPlatformRegistry(_platformRegistry);
    }

    /**
     * @notice Отправляет пожертвование в эту кампанию.
     * @dev Удерживает комиссию платформы и вознаграждает донора токенами.
     */
    function donate() public payable nonReentrant {
        if (block.timestamp >= deadline) revert CampaignHasEnded();
        if (msg.value == 0) revert ZeroDonation();

        uint8 feePercentage = platformRegistry.getFeePercentage();
        uint256 feeAmount = (msg.value * feePercentage) / 100;
        uint256 netAmount = msg.value - feeAmount;

        donations[msg.sender] += netAmount;
        totalDonated += netAmount;

        if (feeAmount > 0) {
            address feeRecipient = platformRegistry.getFeeAddress();
            (bool success, ) = feeRecipient.call{value: feeAmount}("");
            if (!success) revert TransferFailed();
        }

        platformRegistry.rewardDonor(msg.sender, netAmount);

        emit Donated(msg.sender, netAmount, feeAmount);
    }

    /**
     * @notice Создает запрос на расходование средств. Доступно только владельцу кампании.
     * @param _description Цель расхода (напр., "Закупка 50 аптечек").
     * @param _amount Сумма расхода в WEI.
     * @param _recipient Адрес получателя средств.
     */
    function createSpendingRequest(string calldata _description, uint256 _amount, address payable _recipient) external onlyCampaignOwner {
        if (_recipient == address(0)) revert AddressZero();
        if (totalDonated < goal) revert GoalNotReached();
        
        uint256 availableToSpend = totalDonated - totalSpent;
        if (_amount > availableToSpend) revert InsufficientFundsInContract();

        SpendingRequest storage newRequest = spendingRequests[nextRequestId];
        newRequest.description = _description;
        newRequest.amount = _amount;
        newRequest.recipient = _recipient;
        
        emit RequestCreated(nextRequestId, _description, _amount, _recipient);
        nextRequestId++;
    }

    /**
     * @notice Позволяет донору проголосовать за запрос на расход.
     * @dev Вес голоса равен сумме пожертвований донора.
     * @param _requestId ID запроса для голосования.
     */
    function voteForRequest(uint256 _requestId) external onlyDonors {
        SpendingRequest storage requestToVote = spendingRequests[_requestId];
        if (bytes(requestToVote.description).length == 0) revert RequestDoesNotExist();
        if (requestToVote.voters[msg.sender]) revert AlreadyVoted();

        requestToVote.voters[msg.sender] = true;
        requestToVote.approvalVotes += donations[msg.sender];

        emit RequestVoted(_requestId, msg.sender, donations[msg.sender]);
    }
    
    /**
     * @notice Исполняет запрос, если набран кворум голосов (более 50% от всех донатов).
     * @dev Доступно только владельцу кампании.
     * @param _requestId ID запроса для исполнения.
     */
    function executeRequest(uint256 _requestId) external nonReentrant onlyCampaignOwner {
        SpendingRequest storage requestToExecute = spendingRequests[_requestId];
        if (bytes(requestToExecute.description).length == 0) revert RequestDoesNotExist();
        if (requestToExecute.executed) revert RequestAlreadyExecuted();
        
        uint256 requiredApprovals = totalDonated / 2;
        if (requestToExecute.approvalVotes <= requiredApprovals) {
            revert InsufficientApprovals(requiredApprovals, requestToExecute.approvalVotes);
        }

        uint256 availableToSpend = totalDonated - totalSpent;
        if (requestToExecute.amount > availableToSpend) revert InsufficientFundsInContract();

        requestToExecute.executed = true;
        totalSpent += requestToExecute.amount;

        (bool success, ) = requestToExecute.recipient.call{value: requestToExecute.amount}("");
        if (!success) revert TransferFailed();

        emit RequestExecuted(_requestId, requestToExecute.amount);
    }

    /**
     * @notice Позволяет донору вернуть свои средства, если кампания провалилась (цель не достигнута к дедлайну).
     */
    function refundIfFailed() external nonReentrant {
        if (block.timestamp < deadline) revert CampaignIsActive();
        if (totalDonated >= goal) revert CampaignNotSuccessful();

        uint256 amountToRefund = donations[msg.sender];
        if (amountToRefund == 0) revert NothingToRefund();

        donations[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amountToRefund}("");
        
        if (!success) {
            donations[msg.sender] = amountToRefund; 
            revert TransferFailed();
        }

        emit Refunded(msg.sender, amountToRefund);
    }

    /**
     * @notice Возвращает текущий баланс средств на контракте, доступных для расходования.
     */
    function getAvailableFunds() public view returns (uint256) {
        return totalDonated - totalSpent;
    }
    
    /**
     * @notice Возвращает реальный баланс ETH на контракте. Полезно для отладки.
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }


    receive() external payable {
        donate();
    }
}